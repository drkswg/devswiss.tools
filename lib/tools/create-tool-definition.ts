import {
  toolDefinitionSchema,
  type AccentToken,
  type IconKey,
  type ToolActionDefinition,
  type ToolDefinition,
  type ToolStatus
} from '@/lib/tools/contracts';

type CreateToolDefinitionInput = {
  accentToken: AccentToken;
  category?: string;
  description: string;
  iconKey: IconKey;
  id?: string;
  keywords?: string[];
  name: string;
  order: number;
  routePath?: string;
  slug: string;
  status?: ToolStatus;
  supportedActions?: ToolActionDefinition[];
  supportsCopy?: boolean;
};

const slugPattern = /^[a-z0-9-]+$/;

function normalizeSlug(rawValue: string): string {
  const normalized = rawValue.trim().toLowerCase();

  if (!slugPattern.test(normalized)) {
    throw new Error(`Invalid tool slug "${rawValue}". Use lowercase letters, numbers, and hyphens only.`);
  }

  return normalized;
}

function normalizeRoutePath(rawRoutePath: string | undefined, slug: string): string {
  const fallback = `/tools/${slug}`;

  if (!rawRoutePath) {
    return fallback;
  }

  const trimmed = rawRoutePath.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  const routePath = normalized.length === 0 ? fallback : normalized;

  if (!routePath.startsWith('/tools/')) {
    throw new Error(`Invalid tool route path "${rawRoutePath}". Route paths must start with "/tools/".`);
  }

  return routePath;
}

export function createToolDefinition(input: CreateToolDefinitionInput): ToolDefinition {
  const slug = normalizeSlug(input.slug);
  const id = normalizeSlug(input.id ?? slug);

  const parsed = toolDefinitionSchema.parse({
    accentToken: input.accentToken,
    category: input.category?.trim() || 'Developer Utilities',
    description: input.description.trim(),
    iconKey: input.iconKey,
    id,
    keywords: input.keywords ?? [],
    name: input.name.trim(),
    order: input.order,
    routePath: normalizeRoutePath(input.routePath, slug),
    slug,
    status: input.status ?? 'active',
    supportedActions: input.supportedActions ?? [],
    supportsCopy: input.supportsCopy ?? false
  });

  for (const action of parsed.supportedActions) {
    if (action.toolId !== parsed.id) {
      throw new Error(
        `Invalid action "${action.actionId}" for "${parsed.id}": action toolId "${action.toolId}" does not match definition id.`
      );
    }
  }

  return parsed;
}
