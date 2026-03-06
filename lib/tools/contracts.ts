import { z } from 'zod';

export const accentTokens = ['orange', 'green', 'blue', 'yellow'] as const;
export const iconKeys = ['binary', 'clock', 'fingerprint', 'hash', 'sparkles', 'wrench'] as const;
export const toolStatuses = ['active', 'coming-soon'] as const;
export const toolActionModes = ['generate', 'validate', 'encode', 'decode', 'build'] as const;
export const toolResultKinds = ['text', 'status', 'expression'] as const;

export type AccentToken = (typeof accentTokens)[number];
export type IconKey = (typeof iconKeys)[number];
export type ToolStatus = (typeof toolStatuses)[number];
export type ToolActionMode = (typeof toolActionModes)[number];
export type ToolResultKind = (typeof toolResultKinds)[number];

export const accentTokenSchema = z.enum(accentTokens);
export const iconKeySchema = z.enum(iconKeys);
export const toolStatusSchema = z.enum(toolStatuses);
export const toolActionModeSchema = z.enum(toolActionModes);
export const toolResultKindSchema = z.enum(toolResultKinds);

export const toolActionDefinitionSchema = z.object({
  actionId: z.string().min(1),
  helperText: z.string().min(1).optional(),
  inputFields: z.array(z.string().min(1)).min(1),
  label: z.string().min(1),
  mode: toolActionModeSchema,
  resultKind: toolResultKindSchema,
  toolId: z.string().min(1)
});

export const toolDefinitionSchema = z.object({
  accentToken: accentTokenSchema,
  category: z.string().min(1),
  description: z.string().min(1),
  iconKey: iconKeySchema,
  id: z.string().regex(/^[a-z0-9-]+$/),
  keywords: z.array(z.string().min(1)).default([]),
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  routePath: z.string().regex(/^\/tools\/[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: toolStatusSchema.default('active'),
  supportedActions: z.array(toolActionDefinitionSchema).default([]),
  supportsCopy: z.boolean().default(false)
});

export type ToolActionDefinition = z.infer<typeof toolActionDefinitionSchema>;
export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;

export type ToolSummary = Pick<
  ToolDefinition,
  'accentToken' | 'category' | 'description' | 'iconKey' | 'name' | 'routePath' | 'slug' | 'status'
>;
