import { validate as uuidValidate } from 'uuid';
import { z } from 'zod';

import { formatFieldErrors } from '@/lib/validation/common';

export const supportedUuidVersions = ['v1', 'v3', 'v4', 'v5', 'v7'] as const;
export const uuidModes = ['generate', 'validate'] as const;

export type SupportedUuidVersion = (typeof supportedUuidVersions)[number];
export type UuidMode = (typeof uuidModes)[number];

export const supportedUuidVersionSchema = z.enum(supportedUuidVersions);
export const uuidModeSchema = z.enum(uuidModes);

const namespaceSchema = z
  .string()
  .trim()
  .min(1, 'Namespace is required.')
  .refine((value) => uuidValidate(value), {
    message: 'Namespace must be a valid UUID.'
  });

const nameSchema = z.string().trim().min(1, 'Name is required.');

export const uuidGenerateSchema = z
  .object({
    mode: z.literal('generate'),
    version: supportedUuidVersionSchema,
    namespace: z.string().default(''),
    name: z.string().default('')
  })
  .superRefine((value, context) => {
    if (value.version !== 'v3' && value.version !== 'v5') {
      return;
    }

    const parsedNamespace = namespaceSchema.safeParse(value.namespace);
    if (!parsedNamespace.success) {
      for (const issue of parsedNamespace.error.issues) {
        context.addIssue({
          code: 'custom',
          path: ['namespace'],
          message: issue.message
        });
      }
    }

    const parsedName = nameSchema.safeParse(value.name);
    if (!parsedName.success) {
      for (const issue of parsedName.error.issues) {
        context.addIssue({
          code: 'custom',
          path: ['name'],
          message: issue.message
        });
      }
    }
  });

export const uuidValidateSchema = z.object({
  mode: z.literal('validate'),
  value: z.string().trim().min(1, 'UUID value is required.')
});

export type UuidGenerateInput = z.infer<typeof uuidGenerateSchema>;
export type UuidValidateInput = z.infer<typeof uuidValidateSchema>;

export function getUuidFieldErrors(error: z.ZodError) {
  return formatFieldErrors(error);
}
