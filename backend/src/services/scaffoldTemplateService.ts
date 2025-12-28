/**
 * Scaffold Template Service
 * 
 * Integrates scaffold templates into the prompt assembly engine.
 * Provides template filtering, adaptation, and prompt generation for scaffolding tasks.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { UserProfile } from '../types/index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  default?: string;
  examples?: string[];
}

interface ScaffoldTemplate {
  id: string;
  milestone: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  tags: string[];
  stack: string[];
  security_level: 'required' | 'recommended' | 'optional';
  optimization_level: 'required' | 'recommended' | 'optional';
  content: string;
  variables?: TemplateVariable[];
}

interface TemplateFilter {
  milestone?: string[];
  stack?: string[];
  priority?: 'high' | 'medium' | 'low';
  security_level?: 'required' | 'recommended' | 'optional';
  optimization_level?: 'required' | 'recommended' | 'optional';
  tags?: string[];
  exclude_tags?: string[];
}

interface TemplateAdaptationConfig {
  framework?: 'express' | 'fastify' | 'nextjs';
  database?: 'postgresql' | 'supabase' | 'mongodb';
  authMethod?: 'jwt' | 'oauth' | 'session';
  variables?: Record<string, string>;
}

export class ScaffoldTemplateService {
  private templates: Map<string, ScaffoldTemplate> = new Map();
  private catalog: any;

  constructor() {
    this.loadCatalog();
    this.loadTemplates();
  }

  /**
   * Load template catalog
   */
  private loadCatalog() {
    try {
      const catalogPath = join(__dirname, '../../templates/catalog.json');
      const catalogContent = readFileSync(catalogPath, 'utf-8');
      this.catalog = JSON.parse(catalogContent);
    } catch (error) {
      logger.error('Failed to load template catalog', error as Error);
      throw new Error('Template catalog not found');
    }
  }

  /**
   * Load all template files
   */
  private loadTemplates() {
    try {
      const templatesDir = join(__dirname, '../../templates/milestones');
      const milestones = this.catalog.milestones;

      for (const [milestoneId, milestoneData] of Object.entries(milestones as Record<string, any>)) {
        for (const templateMeta of milestoneData.templates) {
          try {
            const templatePath = join(
              templatesDir,
              milestoneId,
              `${templateMeta.id}.yaml`
            );
            
            // Check if file exists before reading
            try {
              const templateContent = readFileSync(templatePath, 'utf-8');
              const template = yaml.load(templateContent) as ScaffoldTemplate;
              
              // Validate template matches catalog
              if (template && template.id === templateMeta.id) {
                this.templates.set(template.id, template);
              }
            } catch (fileError: any) {
              if (fileError.code === 'ENOENT') {
                logger.debug(`Template file not found: ${templatePath}, skipping`);
              } else {
                logger.warn(`Failed to load template ${templateMeta.id}`, fileError as Error);
              }
            }
          } catch (error) {
            logger.warn(`Failed to process template ${templateMeta.id}`, error as Error);
          }
        }
      }

      logger.info(`Loaded ${this.templates.size} scaffold templates`);
    } catch (error) {
      logger.error('Failed to load templates', error as Error);
      // Don't throw - allow service to start even if some templates fail to load
    }
  }

  /**
   * Filter templates based on criteria
   */
  filterTemplates(filter: TemplateFilter): ScaffoldTemplate[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const securityOrder = { required: 3, recommended: 2, optional: 1 };
    const optimizationOrder = { required: 3, recommended: 2, optional: 1 };

    const minPriority = filter.priority ? priorityOrder[filter.priority] : 1;
    const minSecurity = filter.security_level ? securityOrder[filter.security_level] : 1;
    const minOptimization = filter.optimization_level
      ? optimizationOrder[filter.optimization_level]
      : 1;

    const results: ScaffoldTemplate[] = [];

    for (const template of this.templates.values()) {
      // Filter by milestone
      if (filter.milestone && filter.milestone.length > 0) {
        if (!filter.milestone.includes(template.milestone)) {
          continue;
        }
      }

      // Filter by priority
      if (priorityOrder[template.priority] < minPriority) {
        continue;
      }

      // Filter by security level
      if (securityOrder[template.security_level] < minSecurity) {
        continue;
      }

      // Filter by optimization level
      if (optimizationOrder[template.optimization_level] < minOptimization) {
        continue;
      }

      // Filter by stack
      if (filter.stack && filter.stack.length > 0) {
        const hasStackMatch = filter.stack.some((s) =>
          template.stack.some((ts) =>
            ts.toLowerCase().includes(s.toLowerCase())
          )
        );
        if (!hasStackMatch) {
          continue;
        }
      }

      // Filter by tags (all must match)
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every((tag) =>
          template.tags.some((tt) => tt.toLowerCase() === tag.toLowerCase())
        );
        if (!hasAllTags) {
          continue;
        }
      }

      // Exclude by tags
      if (filter.exclude_tags && filter.exclude_tags.length > 0) {
        const hasExcludedTag = filter.exclude_tags.some((tag) =>
          template.tags.some((tt) => tt.toLowerCase() === tag.toLowerCase())
        );
        if (hasExcludedTag) {
          continue;
        }
      }

      results.push(template);
    }

    return results;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ScaffoldTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Adapt template content for specific tech stack
   */
  adaptTemplate(
    template: ScaffoldTemplate,
    config: TemplateAdaptationConfig
  ): string {
    let adapted = template.content;

    const {
      framework = 'express',
      database = 'postgresql',
      authMethod = 'jwt',
      variables = {},
    } = config;

    // Framework adaptations
    adapted = this.adaptFramework(adapted, framework);

    // Database adaptations
    adapted = this.adaptDatabase(adapted, database);

    // Auth method adaptations
    adapted = this.adaptAuthMethod(adapted, authMethod);

    // Variable substitutions
    adapted = this.substituteVariables(adapted, variables);

    return adapted;
  }

  /**
   * Generate scaffold prompt from templates
   * Integrates with the existing prompt assembly system
   */
  generateScaffoldPrompt(
    taskDescription: string,
    userProfile: UserProfile,
    selectedTemplates: string[],
    adaptationConfig?: TemplateAdaptationConfig
  ): {
    systemPrompt: string;
    userPrompt: string;
    templates: ScaffoldTemplate[];
    adaptedContent: Record<string, string>;
  } {
    // Load selected templates
    const templates = selectedTemplates
      .map((id) => this.getTemplate(id))
      .filter((t): t is ScaffoldTemplate => t !== null);

    // Order by dependencies
    const orderedTemplates = this.orderByDependencies(templates);

    // Adapt templates
    const adaptedContent: Record<string, string> = {};
    const adaptedTemplates: string[] = [];

    for (const template of orderedTemplates) {
      const adapted = this.adaptTemplate(
        template,
        adaptationConfig || this.inferAdaptationConfig(userProfile)
      );
      adaptedContent[template.id] = adapted;
      adaptedTemplates.push(adapted);
    }

    // Generate system prompt
    const systemPrompt = this.composeSystemPrompt(orderedTemplates, userProfile);

    // Generate user prompt
    const userPrompt = this.composeUserPrompt(
      taskDescription,
      orderedTemplates,
      userProfile
    );

    return {
      systemPrompt,
      userPrompt,
      templates: orderedTemplates,
      adaptedContent,
    };
  }

  /**
   * Infer adaptation config from user profile
   */
  private inferAdaptationConfig(
    userProfile: UserProfile
  ): TemplateAdaptationConfig {
    const stack = userProfile.stack || {};
    
    // Infer framework
    let framework: 'express' | 'fastify' | 'nextjs' = 'express';
    if (stack.nextjs) {
      framework = 'nextjs';
    }

    // Infer database
    let database: 'postgresql' | 'supabase' | 'mongodb' = 'postgresql';
    if (stack.supabase) {
      database = 'supabase';
    }

    // Default auth method
    const authMethod: 'jwt' | 'oauth' | 'session' = 'jwt';

    return {
      framework,
      database,
      authMethod,
    };
  }

  /**
   * Compose system prompt from templates
   */
  private composeSystemPrompt(
    templates: ScaffoldTemplate[],
    userProfile: UserProfile
  ): string {
    let prompt = `You are an expert full-stack developer specializing in secure, optimized code scaffolding.\n\n`;
    prompt += `Your role: ${userProfile.role || 'developer'}\n`;
    prompt += `Your stack: ${JSON.stringify(userProfile.stack || {})}\n\n`;

    prompt += `You will scaffold code following these milestones and best practices:\n\n`;

    // Group by milestone
    const byMilestone = new Map<string, ScaffoldTemplate[]>();
    for (const template of templates) {
      if (!byMilestone.has(template.milestone)) {
        byMilestone.set(template.milestone, []);
      }
      byMilestone.get(template.milestone)!.push(template);
    }

    for (const [milestone, milestoneTemplates] of byMilestone.entries()) {
      const milestoneName =
        this.catalog.milestones[milestone]?.name || milestone;
      prompt += `## ${milestoneName}\n\n`;

      for (const template of milestoneTemplates) {
        prompt += `### ${template.name}\n`;
        prompt += `${template.description}\n\n`;

        // Add security considerations
        if (template.security_level === 'required') {
          prompt += `**Security Requirements:** Must implement security best practices.\n`;
        }

        // Add optimization considerations
        if (template.optimization_level === 'required') {
          prompt += `**Performance Requirements:** Must optimize for performance.\n`;
        }

        prompt += `\n`;
      }
    }

    prompt += `\nAlways prioritize:\n`;
    prompt += `1. Security best practices (input validation, authentication, authorization, RLS policies)\n`;
    prompt += `2. Performance optimization (caching, indexing, query optimization)\n`;
    prompt += `3. Code quality (type safety, error handling, logging)\n`;
    prompt += `4. Maintainability (clear structure, documentation, testing)\n`;

    return prompt;
  }

  /**
   * Compose user prompt from task and templates
   */
  private composeUserPrompt(
    taskDescription: string,
    templates: ScaffoldTemplate[],
    userProfile: UserProfile
  ): string {
    let prompt = `Task: ${taskDescription}\n\n`;

    prompt += `Implement the following components:\n\n`;

    for (const template of templates) {
      prompt += `- ${template.name}: ${template.description}\n`;
    }

    if (userProfile.company_context) {
      prompt += `\nCompany Context: ${userProfile.company_context}\n`;
    }

    if (userProfile.brand_voice) {
      prompt += `\nBrand Voice: ${userProfile.brand_voice}\n`;
    }

    return prompt;
  }

  /**
   * Order templates by dependencies
   */
  private orderByDependencies(
    templates: ScaffoldTemplate[]
  ): ScaffoldTemplate[] {
    const ordered: ScaffoldTemplate[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (templateId: string) => {
      if (visiting.has(templateId)) {
        throw new Error(`Circular dependency detected: ${templateId}`);
      }
      if (visited.has(templateId)) {
        return;
      }

      visiting.add(templateId);
      const template = templates.find((t) => t.id === templateId);

      if (template && template.dependencies) {
        for (const depId of template.dependencies) {
          const depTemplate = templates.find((t) => t.id === depId);
          if (depTemplate) {
            visit(depId);
          }
        }
      }

      visiting.delete(templateId);
      visited.add(templateId);

      const templateToAdd = templates.find((t) => t.id === templateId);
      if (templateToAdd && !ordered.includes(templateToAdd)) {
        ordered.push(templateToAdd);
      }
    };

    for (const template of templates) {
      visit(template.id);
    }

    return ordered;
  }

  /**
   * Framework adaptation
   */
  private adaptFramework(content: string, framework: string): string {
    const adaptations: Record<string, Record<string, string>> = {
      express: {
        '{{import_framework}}': "import express from 'express';",
        '{{create_app}}': 'const app = express();',
        '{{use_middleware}}': 'app.use',
        '{{export_app}}': 'export default app;',
      },
      fastify: {
        '{{import_framework}}': "import Fastify from 'fastify';",
        '{{create_app}}': 'const app = Fastify();',
        '{{use_middleware}}': 'app.register',
        '{{export_app}}': 'export default app;',
      },
      nextjs: {
        '{{import_framework}}': "import { NextRequest, NextResponse } from 'next/server';",
        '{{create_app}}': '',
        '{{use_middleware}}': 'export function middleware',
        '{{export_app}}': '',
      },
    };

    const frameworkAdaptations = adaptations[framework] || adaptations.express;

    let adapted = content;
    for (const [placeholder, replacement] of Object.entries(frameworkAdaptations)) {
      adapted = adapted.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
        replacement
      );
    }

    return adapted;
  }

  /**
   * Database adaptation
   */
  private adaptDatabase(content: string, database: string): string {
    const adaptations: Record<string, Record<string, string>> = {
      postgresql: {
        '{{db_client}}': 'pg',
        '{{db_import}}': "import { Pool } from 'pg';",
        '{{db_create_client}}':
          'const pool = new Pool({ connectionString: process.env.DATABASE_URL });',
        '{{db_query}}': 'await pool.query',
      },
      supabase: {
        '{{db_client}}': 'supabase',
        '{{db_import}}': "import { createClient } from '@supabase/supabase-js';",
        '{{db_create_client}}':
          "const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);",
        '{{db_query}}': "await supabase.from",
      },
      mongodb: {
        '{{db_client}}': 'mongodb',
        '{{db_import}}': "import { MongoClient } from 'mongodb';",
        '{{db_create_client}}':
          "const client = new MongoClient(process.env.MONGODB_URI!);",
        '{{db_query}}': 'await collection',
      },
    };

    const dbAdaptations = adaptations[database] || adaptations.postgresql;

    let adapted = content;
    for (const [placeholder, replacement] of Object.entries(dbAdaptations)) {
      adapted = adapted.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
        replacement
      );
    }

    return adapted;
  }

  /**
   * Auth method adaptation
   */
  private adaptAuthMethod(content: string, authMethod: string): string {
    const adaptations: Record<string, Record<string, string>> = {
      jwt: {
        '{{auth_import}}': "import jwt from 'jsonwebtoken';",
        '{{auth_verify}}': 'jwt.verify(token, process.env.JWT_SECRET!)',
        '{{auth_sign}}':
          'jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "{{expires}}" })',
      },
      oauth: {
        '{{auth_import}}': "import { OAuth2Client } from 'google-auth-library';",
        '{{auth_verify}}': 'await oauth2Client.verifyIdToken({ idToken: token })',
        '{{auth_sign}}': '// OAuth tokens are issued by provider',
      },
      session: {
        '{{auth_import}}': "import session from 'express-session';",
        '{{auth_verify}}': 'req.session.userId',
        '{{auth_sign}}': 'req.session.userId = userId',
      },
    };

    const authAdaptations = adaptations[authMethod] || adaptations.jwt;

    let adapted = content;
    for (const [placeholder, replacement] of Object.entries(authAdaptations)) {
      adapted = adapted.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
        replacement
      );
    }

    return adapted;
  }

  /**
   * Variable substitution
   */
  private substituteVariables(
    content: string,
    variables: Record<string, string>
  ): string {
    let substituted = content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      substituted = substituted.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
        value
      );
    }

    return substituted;
  }

  /**
   * Get recommended templates for a project
   */
  getRecommendedTemplates(
    userProfile: UserProfile,
    taskDescription: string
  ): ScaffoldTemplate[] {
    // Extract stack from profile
    const stack: string[] = [];
    if (userProfile.stack) {
      if (userProfile.stack.nextjs) stack.push('nextjs');
      if (userProfile.stack.supabase) stack.push('supabase');
      if (userProfile.stack.code_repo) stack.push('express');
    }

    // Filter templates
    const filter: TemplateFilter = {
      stack: stack.length > 0 ? stack : undefined,
      priority: 'medium',
      security_level: 'recommended',
      optimization_level: 'recommended',
    };

    const templates = this.filterTemplates(filter);

    // Infer templates from task description
    const lowerTask = taskDescription.toLowerCase();
    const inferred: ScaffoldTemplate[] = [];

    if (lowerTask.includes('auth') || lowerTask.includes('login')) {
      const authTemplate = templates.find((t) => t.id === 'auth-jwt-middleware');
      if (authTemplate) inferred.push(authTemplate);
    }

    if (lowerTask.includes('database') || lowerTask.includes('schema') || lowerTask.includes('rls')) {
      const rlsTemplate = templates.find((t) => t.id === 'db-rls-policies');
      if (rlsTemplate) inferred.push(rlsTemplate);
    }

    if (lowerTask.includes('api') || lowerTask.includes('route') || lowerTask.includes('endpoint')) {
      const apiTemplates = templates.filter((t) => t.tags.includes('api'));
      inferred.push(...apiTemplates.slice(0, 3));
    }

    if (lowerTask.includes('security') || lowerTask.includes('secure')) {
      const securityTemplates = templates.filter((t) => t.tags.includes('security'));
      inferred.push(...securityTemplates);
    }

    // Combine and deduplicate
    const allTemplates = [...templates.slice(0, 5), ...inferred];
    const unique = Array.from(
      new Map(allTemplates.map((t) => [t.id, t])).values()
    );

    return this.orderByDependencies(unique);
  }
}

export const scaffoldTemplateService = new ScaffoldTemplateService();
