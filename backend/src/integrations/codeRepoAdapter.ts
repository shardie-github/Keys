import axios from 'axios';
import crypto from 'crypto';

export interface CodeRepoWebhook {
  id: string;
  event: string;
  repository: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  branch: string;
  base_branch: string;
  created_at: string;
  updated_at: string;
  mergeable?: boolean;
  labels?: string[];
}

export interface BuildStatus {
  id: string;
  status: 'success' | 'failure' | 'pending' | 'error';
  branch: string;
  commit: string;
  workflow?: string;
  started_at: string;
  completed_at?: string;
  logs_url?: string;
}

export class CodeRepoAdapter {
  private apiKey?: string;
  private apiSecret?: string;
  private repoUrl?: string;
  private provider: 'github' | 'gitlab' | 'bitbucket';

  constructor() {
    this.apiKey = process.env.CODE_REPO_API_KEY || process.env.GITHUB_TOKEN;
    this.apiSecret = process.env.CODE_REPO_WEBHOOK_SECRET || process.env.GITHUB_WEBHOOK_SECRET;
    this.repoUrl = process.env.CODE_REPO_URL || process.env.GITHUB_REPO_URL;
    // Default to GitHub, but can be overridden via env
    this.provider = (process.env.CODE_REPO_PROVIDER as 'github' | 'gitlab' | 'bitbucket') || 'github';
  }

  /**
   * Verify webhook signature (GitHub, GitLab, Bitbucket)
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string = this.apiSecret || ''
  ): boolean {
    if (!secret) {
      console.warn('No webhook secret configured');
      return false;
    }

    if (this.provider === 'github') {
      const hmac = crypto.createHmac('sha256', secret);
      const hash = hmac.update(body, 'utf8').digest('hex');
      return `sha256=${hash}` === signature;
    }

    // GitLab uses different signature format
    if (this.provider === 'gitlab') {
      const hmac = crypto.createHmac('sha256', secret);
      const hash = hmac.update(body, 'utf8').digest('hex');
      return hash === signature;
    }

    // Bitbucket uses HMAC-SHA256 in header
    if (this.provider === 'bitbucket') {
      const hmac = crypto.createHmac('sha256', secret);
      const hash = hmac.update(body, 'utf8').digest('hex');
      return hash === signature;
    }

    return false;
  }

  /**
   * Parse webhook payload
   */
  parseWebhook(body: any, headers: Record<string, string>): CodeRepoWebhook | null {
    try {
      const signature = headers['x-hub-signature-256'] || 
                       headers['x-gitlab-token'] || 
                       headers['x-hub-signature'] ||
                       headers['X-Hub-Signature-256'] ||
                       headers['X-Gitlab-Token'];

      if (signature && this.apiSecret) {
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        if (!this.verifyWebhookSignature(bodyString, signature)) {
          console.error('Invalid webhook signature');
          return null;
        }
      }

      const data = typeof body === 'object' ? body : JSON.parse(typeof body === 'string' ? body : JSON.stringify(body));
      
      // Extract event type based on provider
      let event = '';
      if (this.provider === 'github') {
        event = headers['x-github-event'] || headers['X-GitHub-Event'] || '';
      } else if (this.provider === 'gitlab') {
        event = headers['x-gitlab-event'] || headers['X-Gitlab-Event'] || '';
      } else if (this.provider === 'bitbucket') {
        event = headers['x-event-key'] || headers['X-Event-Key'] || '';
      }

      const repository = data.repository?.full_name || 
                        data.project?.path_with_namespace || 
                        data.repository?.full_name ||
                        'unknown';

      return {
        id: data.id || crypto.randomUUID(),
        event,
        repository,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error parsing code repo webhook:', error);
      return null;
    }
  }

  /**
   * Convert webhook event to internal event type
   */
  eventToEventType(event: string, action?: string): string {
    const mapping: Record<string, string> = {
      'pull_request.opened': 'repo.pr.opened',
      'pull_request.closed': 'repo.pr.closed',
      'pull_request.merged': 'repo.pr.merged',
      'pull_request.synchronize': 'repo.pr.updated',
      'push': 'repo.push',
      'workflow_run.completed': 'repo.build.completed',
      'pipeline.finished': 'repo.build.completed',
      'check_run.completed': 'repo.build.completed',
      'issues.opened': 'issue.created',
      'issues.closed': 'issue.closed',
      'issues.reopened': 'issue.reopened',
      'issue_comment.created': 'issue.comment.created',
    };

    const key = action ? `${event}.${action}` : event;
    return mapping[key] || `repo.${event.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
  }

  /**
   * Fetch pull request details
   */
  async fetchPullRequest(prNumber: number): Promise<PullRequest | null> {
    if (!this.apiKey || !this.repoUrl) {
      console.warn('Code repo credentials not configured');
      return null;
    }

    try {
      // GitHub API
      if (this.provider === 'github') {
        const url = `https://api.github.com/repos/${this.repoUrl}/pulls/${prNumber}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        const pr = response.data;
        return {
          id: pr.id.toString(),
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state === 'closed' && pr.merged ? 'merged' : (pr.state as 'open' | 'closed'),
          author: pr.user?.login || '',
          branch: pr.head.ref,
          base_branch: pr.base.ref,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          mergeable: pr.mergeable,
          labels: pr.labels?.map((l: any) => l.name) || [],
        };
      }

      // GitLab API
      if (this.provider === 'gitlab') {
        const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(this.repoUrl)}/merge_requests/${prNumber}`;
        const response = await axios.get(url, {
          headers: {
            'PRIVATE-TOKEN': this.apiKey,
          },
        });

        const mr = response.data;
        return {
          id: mr.id.toString(),
          number: mr.iid,
          title: mr.title,
          body: mr.description,
          state: mr.state === 'merged' ? 'merged' : (mr.state as 'open' | 'closed'),
          author: mr.author?.username || '',
          branch: mr.source_branch,
          base_branch: mr.target_branch,
          created_at: mr.created_at,
          updated_at: mr.updated_at,
          labels: mr.labels || [],
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching pull request:', error);
      return null;
    }
  }

  /**
   * Check build status for a branch/commit
   */
  async checkBuildStatus(branch: string, commit?: string): Promise<BuildStatus | null> {
    if (!this.apiKey || !this.repoUrl) {
      return null;
    }

    try {
      // GitHub Actions
      if (this.provider === 'github') {
        const sha = commit || 'HEAD';
        const url = `https://api.github.com/repos/${this.repoUrl}/commits/${sha}/check-runs`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        const checkRuns = response.data.check_runs || [];
        const latestRun = checkRuns[0];

        if (!latestRun) {
          return null;
        }

        return {
          id: latestRun.id.toString(),
          status: latestRun.conclusion === 'success' ? 'success' : 
                 latestRun.conclusion === 'failure' ? 'failure' : 
                 latestRun.status === 'completed' ? 'error' : 'pending',
          branch,
          commit: sha,
          workflow: latestRun.name,
          started_at: latestRun.started_at,
          completed_at: latestRun.completed_at,
          logs_url: latestRun.html_url,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking build status:', error);
      return null;
    }
  }

  /**
   * Get recent pull requests
   */
  async getRecentPullRequests(limit: number = 10, state: 'open' | 'closed' | 'all' = 'open'): Promise<PullRequest[]> {
    if (!this.apiKey || !this.repoUrl) {
      return [];
    }

    try {
      if (this.provider === 'github') {
        const url = `https://api.github.com/repos/${this.repoUrl}/pulls?state=${state}&per_page=${limit}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        return response.data.map((pr: any) => ({
          id: pr.id.toString(),
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state === 'closed' && pr.merged ? 'merged' : (pr.state as 'open' | 'closed'),
          author: pr.user?.login || '',
          branch: pr.head.ref,
          base_branch: pr.base.ref,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          mergeable: pr.mergeable,
          labels: pr.labels?.map((l: any) => l.name) || [],
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching recent pull requests:', error);
      return [];
    }
  }

  /**
   * Check if PR is stale (no activity for X days)
   */
  async isPRStale(prNumber: number, daysThreshold: number = 7): Promise<boolean> {
    const pr = await this.fetchPullRequest(prNumber);
    if (!pr || pr.state !== 'open') {
      return false;
    }

    const lastUpdate = new Date(pr.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > daysThreshold;
  }
}

export const codeRepoAdapter = new CodeRepoAdapter();
