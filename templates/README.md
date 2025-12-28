# Scaffold Prompt Templates

A comprehensive system of **mega prompt templates** for scaffolding full-stack applications. These templates are static, comprehensive prompts that serve as trainable bases and get dynamically modified with user inputs and filters.

## Core Concept

**Mega Prompts** = Static, comprehensive prompt templates that:
- Serve as a consistent base for training models
- Get dynamically modified with user inputs and filters
- Provide structure and best practices
- Are reusable across projects and tech stacks

## Architecture

```
Static Mega Prompt Template
         ↓
User Inputs & Profile Data
         ↓
Input Filters (style, format, etc.)
         ↓
Dynamic Variable Replacement
         ↓
Final Optimized Prompt
         ↓
Model Training/Inference
```

## Template Structure

Templates are stored as `.prompt.yaml` files:

```yaml
id: template-id
milestone: 02-authentication
name: Template Name
description: What it does
priority: high|medium|low
dependencies: [other-template-ids]
tags: [relevant, tags]
stack: [express, typescript]
security_level: required|recommended|optional
optimization_level: required|recommended|optional

# The mega prompt - static base that gets modified
mega_prompt: |
  You are an expert...
  
  ## Context
  Role: {{user_role|default:developer}}
  {{#if company_context}}
  Company: {{company_context}}
  {{/if}}
  
  ## Task
  {{task_description}}

variables:
  - name: user_role
    description: User's role
    required: false
    default: "developer"
```

## Variable System

Templates support dynamic variables:

### Simple Variables
```yaml
{{variable_name}}
{{variable_name|default:fallback_value}}
```

### Conditional Blocks
```yaml
{{#if condition}}
  Content shown if condition is true
{{/if}}

{{#unless condition}}
  Content shown if condition is false
{{/unless}}
```

### Nested Objects
```yaml
{{stack.frontend_framework}}
{{user.profile.role}}
```

## Dynamic Modification

Templates are modified with:

1. **User Profile Data**
   - Role, vertical, stack preferences
   - Company context, brand voice
   - Experience level

2. **Input Filters**
   - Style (concise, detailed, technical)
   - Format (markdown, json, code)
   - Tone preferences

3. **Custom Variables**
   - Project-specific overrides
   - Framework choices
   - Database selections

## Usage

### Automatic (Recommended)

The prompt assembly engine automatically detects scaffold tasks and uses templates:

```bash
POST /assemble-prompt
{
  "userId": "...",
  "taskDescription": "Scaffold authentication middleware",
  "vibeConfig": {...},
  "inputFilter": {
    "style": "technical",
    "outputFormat": "code"
  }
}
```

### Manual Template Selection

```bash
POST /scaffold-templates/generate
{
  "taskDescription": "Setup API routes",
  "templateIds": ["api-route-structure", "api-validation-middleware"],
  "variables": {
    "framework": "express",
    "database": "supabase"
  }
}
```

## Milestones

Templates organized by project milestones:

1. **01-initialization**: Project setup, structure, dependencies
2. **02-authentication**: Auth flows, tokens, sessions
3. **03-database-schema**: Tables, RLS policies, migrations
4. **04-api-routes**: REST endpoints, middleware, validation
5. **05-frontend-routes**: Pages, components, routing
6. **06-security-hardening**: Headers, CSRF, sanitization
7. **07-performance-optimization**: Caching, compression
8. **08-testing**: Unit, integration, E2E tests
9. **09-ci-cd**: GitHub Actions, quality gates
10. **10-deployment**: Docker, env configs, monitoring

## Benefits

1. **Consistency**: Same base prompts ensure consistent outputs
2. **Trainability**: Static bases are perfect for fine-tuning models
3. **Flexibility**: Dynamic modification adapts to any context
4. **Reusability**: One template works across many projects
5. **Maintainability**: Update templates once, affects all uses
6. **Security**: Built-in security considerations in every template

## Template Development

When creating new templates:

1. **Start with comprehensive base**: Include all relevant context
2. **Use variables liberally**: Make templates adaptable
3. **Include security notes**: Always consider security implications
4. **Add optimization hints**: Performance considerations
5. **Document variables**: Clear descriptions and defaults
6. **Test modifications**: Ensure variables work correctly

## Example Template Flow

```
Static Template:
"You are an expert {{user_role}}. Use {{framework}}..."

User Profile:
{ role: "backend-engineer", stack: { express: true } }

Input Filter:
{ style: "technical" }

Result:
"You are an expert backend-engineer. Use Express..."
[Technical style applied]
```

## Integration

Templates integrate seamlessly with:
- Prompt assembly engine (`promptAssembly.ts`)
- Input reformatter (`inputReformatter.ts`)
- User profiles and vibe configs
- Existing filter system

## Next Steps

- Review existing templates: `templates/milestones/`
- Check usage guide: `templates/USAGE.md`
- See integration details: `templates/INTEGRATION.md`
- Create custom templates following the format
