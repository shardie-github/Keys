import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

export interface CatalogTemplate {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  tags: string[];
  stack: string[];
  security_level: 'required' | 'recommended' | 'optional';
  optimization_level: 'required' | 'recommended' | 'optional';
}

export interface CatalogMilestone {
  name: string;
  description: string;
  templates: CatalogTemplate[];
}

export interface TemplateCatalog {
  version: string;
  description: string;
  milestones: Record<string, CatalogMilestone>;
}

const catalogPaths = [
  path.join(process.cwd(), 'templates', 'catalog.json'),
  path.join(process.cwd(), '..', 'templates', 'catalog.json'),
];

export async function loadTemplateCatalog(): Promise<TemplateCatalog | null> {
  for (const candidate of catalogPaths) {
    try {
      const raw = await fs.readFile(candidate, 'utf8');
      return JSON.parse(raw) as TemplateCatalog;
    } catch {
      // Try next path.
    }
  }

  return null;
}

export function flattenTemplateCatalog(catalog: TemplateCatalog) {
  const entries: Array<CatalogTemplate & { templateId: string; milestone: string; milestoneName: string }> = [];

  for (const [milestoneId, milestone] of Object.entries(catalog.milestones)) {
    for (const template of milestone.templates) {
      entries.push({
        ...template,
        templateId: template.id,
        milestone: milestoneId,
        milestoneName: milestone.name,
      });
    }
  }

  return entries;
}
