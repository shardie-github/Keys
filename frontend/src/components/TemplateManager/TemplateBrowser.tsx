/**
 * Template Browser Component
 * 
 * Browse and search templates by milestone, tags, stack, etc.
 */

'use client';

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Template {
  templateId: string;
  name: string;
  description: string;
  milestone: string;
  tags: string[];
  stack: string[];
  priority: string;
  security_level: string;
  optimization_level: string;
  hasCustomization?: boolean;
}

export function TemplateBrowser() {
  const { userProfile } = useUserProfile();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    tags: [] as string[],
    stack: [] as string[],
    priority: [] as string[],
  });

  const milestones = [
    '01-initialization',
    '02-authentication',
    '03-database-schema',
    '04-api-routes',
    '05-frontend-routes',
    '06-security-hardening',
    '07-performance-optimization',
    '08-testing',
    '09-ci-cd',
    '10-deployment',
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedMilestone, searchQuery, filters]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMilestone) params.append('milestone', selectedMilestone);
      if (searchQuery) params.append('query', searchQuery);
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.stack.length > 0) params.append('stack', filters.stack.join(','));
      if (filters.priority.length > 0) params.append('priority', filters.priority.join(','));

      const response = await fetch(`/api/user-templates/search?${params}`);
      const data = await response.json();
      setTemplates(data.results || []);
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-browser">
      <div className="filters-panel">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedMilestone}
          onChange={(e) => setSelectedMilestone(e.target.value)}
          className="milestone-select"
        >
          <option value="">All Milestones</option>
          {milestones.map((milestone) => (
            <option key={milestone} value={milestone}>
              {milestone.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <TemplateCard key={template.templateId} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="template-card">
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <div className="template-meta">
        <span className={`priority priority-${template.priority}`}>
          {template.priority}
        </span>
        <span className={`security security-${template.security_level}`}>
          {template.security_level}
        </span>
        {template.hasCustomization && (
          <span className="customized-badge">Customized</span>
        )}
      </div>
      <div className="template-tags">
        {template.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
