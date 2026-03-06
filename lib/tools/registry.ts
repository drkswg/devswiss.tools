import type { ToolDefinition } from '@/lib/tools/contracts';
import { toolDefinitionSchema } from '@/lib/tools/contracts';
import { createToolDefinition } from '@/lib/tools/create-tool-definition';

function validateUniqueFields(definitions: ToolDefinition[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const routePaths = new Set<string>();

  for (const definition of definitions) {
    if (ids.has(definition.id)) {
      throw new Error(`Duplicate tool id: ${definition.id}`);
    }
    if (slugs.has(definition.slug)) {
      throw new Error(`Duplicate tool slug: ${definition.slug}`);
    }
    if (routePaths.has(definition.routePath)) {
      throw new Error(`Duplicate tool route path: ${definition.routePath}`);
    }

    ids.add(definition.id);
    slugs.add(definition.slug);
    routePaths.add(definition.routePath);
  }
}

export function createToolRegistry(definitions: ToolDefinition[]) {
  const parsed = definitions.map((definition) => toolDefinitionSchema.parse(definition));
  validateUniqueFields(parsed);

  return parsed.sort((left, right) => left.order - right.order);
}

export const toolRegistry = Object.freeze(
  createToolRegistry([
  createToolDefinition({
    id: 'uuid',
    slug: 'uuid',
    name: 'UUID Generator & Validator',
    description: 'Generate UUID versions 1, 3, 4, 5, and 7 or validate a pasted UUID instantly.',
    iconKey: 'fingerprint',
    accentToken: 'orange',
    order: 0,
    category: 'Developer Utilities',
    supportsCopy: true,
    status: 'active',
    keywords: ['uuid', 'guid', 'validator'],
    supportedActions: [
      {
        toolId: 'uuid',
        actionId: 'generate',
        label: 'Generate UUID',
        mode: 'generate',
        inputFields: ['version', 'namespace', 'name'],
        resultKind: 'text',
        helperText: 'Versions 3 and 5 require namespace and name inputs.'
      },
      {
        toolId: 'uuid',
        actionId: 'validate',
        label: 'Validate UUID',
        mode: 'validate',
        inputFields: ['value'],
        resultKind: 'status',
        helperText: 'Validation accepts versions 1, 3, 4, 5, and 7.'
      }
    ]
  }),
  createToolDefinition({
    id: 'base64',
    slug: 'base64',
    name: 'Base64 Encoder & Decoder',
    description: 'Encode plain text or decode Base64 safely, including Unicode content.',
    iconKey: 'binary',
    accentToken: 'blue',
    order: 1,
    category: 'Developer Utilities',
    supportsCopy: true,
    status: 'active',
    keywords: ['base64', 'encode', 'decode'],
    supportedActions: [
      {
        toolId: 'base64',
        actionId: 'encode',
        label: 'Encode',
        mode: 'encode',
        inputFields: ['inputValue'],
        resultKind: 'text'
      },
      {
        toolId: 'base64',
        actionId: 'decode',
        label: 'Decode',
        mode: 'decode',
        inputFields: ['inputValue'],
        resultKind: 'text'
      }
    ]
  }),
  createToolDefinition({
    id: 'hash',
    slug: 'hash',
    name: 'Hash Generator',
    description: 'Create MD5, SHA-1, SHA-256, and SHA-512 hashes entirely in the browser.',
    iconKey: 'hash',
    accentToken: 'green',
    order: 2,
    category: 'Developer Utilities',
    supportsCopy: true,
    status: 'active',
    keywords: ['hash', 'sha256', 'sha512', 'md5'],
    supportedActions: [
      {
        toolId: 'hash',
        actionId: 'generate-hash',
        label: 'Generate hash',
        mode: 'generate',
        inputFields: ['algorithm', 'inputValue'],
        resultKind: 'text',
        helperText: 'MD5 and SHA-1 stay available for legacy compatibility.'
      }
    ]
  }),
  createToolDefinition({
    id: 'cron',
    slug: 'cron',
    name: 'Cron Expression Generator',
    description: 'Build six-field cron expressions with seconds and read them as plain language.',
    iconKey: 'clock',
    accentToken: 'yellow',
    order: 3,
    category: 'Scheduling',
    supportsCopy: true,
    status: 'active',
    keywords: ['cron', 'schedule', 'expression'],
    supportedActions: [
      {
        toolId: 'cron',
        actionId: 'build-cron',
        label: 'Build cron expression',
        mode: 'build',
        inputFields: ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'],
        resultKind: 'expression'
      }
    ]
  })
  ])
);

const emptyTools: readonly ToolDefinition[] = Object.freeze([] as ToolDefinition[]);

const toolBySlugIndex = new Map<string, ToolDefinition>();
const toolByIdIndex = new Map<string, ToolDefinition>();
const categoryIndex = new Map<string, ToolDefinition[]>();

for (const tool of toolRegistry) {
  toolBySlugIndex.set(tool.slug, tool);
  toolByIdIndex.set(tool.id, tool);

  const categoryTools = categoryIndex.get(tool.category);

  if (categoryTools) {
    categoryTools.push(tool);
  } else {
    categoryIndex.set(tool.category, [tool]);
  }
}

const categoryIndexReadonly = new Map<string, readonly ToolDefinition[]>(
  [...categoryIndex.entries()].map(([category, tools]) => [category, Object.freeze([...tools])])
);

export function getAllTools() {
  return toolRegistry;
}

export function getToolBySlug(slug: string) {
  return toolBySlugIndex.get(slug);
}

export function getRequiredToolBySlug(slug: string) {
  const tool = getToolBySlug(slug);

  if (!tool) {
    throw new Error(`Tool not found in registry: ${slug}`);
  }

  return tool;
}

export function getToolById(id: string) {
  return toolByIdIndex.get(id);
}

export function getToolsByCategory(category: string) {
  return categoryIndexReadonly.get(category) ?? emptyTools;
}
