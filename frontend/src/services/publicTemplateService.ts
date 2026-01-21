export interface PublicTemplate {
  templateId: string;
  name: string;
  description: string;
  milestone: string;
  milestoneName?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  stack: string[];
  security_level: 'required' | 'recommended' | 'optional';
  optimization_level: 'required' | 'recommended' | 'optional';
}

export interface PublicTemplateCatalogResponse {
  results: PublicTemplate[];
  milestones: Record<string, unknown>;
  version?: string;
  description?: string;
}

export async function fetchPublicTemplates(filters: {
  query?: string;
  milestone?: string[];
  tags?: string[];
  stack?: string[];
  priority?: string[];
  security_level?: string[];
  optimization_level?: string[];
} = {}): Promise<PublicTemplate[]> {
  try {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.milestone && filters.milestone.length > 0) params.append('milestone', filters.milestone.join(','));
    if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters.stack && filters.stack.length > 0) params.append('stack', filters.stack.join(','));
    if (filters.priority && filters.priority.length > 0) params.append('priority', filters.priority.join(','));
    if (filters.security_level && filters.security_level.length > 0) params.append('security_level', filters.security_level.join(','));
    if (filters.optimization_level && filters.optimization_level.length > 0) params.append('optimization_level', filters.optimization_level.join(','));

    const response = await fetch(`/api/public/templates?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await response.json()) as PublicTemplateCatalogResponse;
    return data.results || [];
  } catch {
    return [];
  }
}

export async function fetchPublicTemplate(templateId: string): Promise<PublicTemplate | null> {
  if (!templateId) return null;

  try {
    const response = await fetch(`/api/public/templates/${templateId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await response.json()) as { template: PublicTemplate | null };
    return data.template ?? null;
  } catch {
    return null;
  }
}
