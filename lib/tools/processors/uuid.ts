import { v1 as uuidV1, v3 as uuidV3, v4 as uuidV4, v5 as uuidV5, v7 as uuidV7, validate, version } from 'uuid';

import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import {
  getUuidFieldErrors,
  supportedUuidVersionSchema,
  uuidGenerateSchema,
  uuidValidateSchema,
  type SupportedUuidVersion
} from '@/lib/validation/uuid';

export type UuidProcessorResult = {
  fieldErrors?: FieldErrors;
  message: string;
  state: Exclude<ValidationState, 'idle'>;
  value?: string;
  version?: SupportedUuidVersion;
};

export const defaultUuidNamespace = uuidV5.DNS;

const supportedUuidVersionNumbers = new Set([1, 3, 4, 5, 7]);

function buildVersionMessage(prefix: string, uuidVersion: SupportedUuidVersion) {
  return `${prefix} ${uuidVersion.toUpperCase()} UUID.`;
}

export function generateUuid(input: {
  mode: 'generate';
  name?: string;
  namespace?: string;
  version: SupportedUuidVersion;
}): UuidProcessorResult {
  const parsed = uuidGenerateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      state: 'invalid',
      message: 'Provide the required UUID inputs before generating a value.',
      fieldErrors: getUuidFieldErrors(parsed.error)
    };
  }

  try {
    const { version: uuidVersion, namespace, name } = parsed.data;

    switch (uuidVersion) {
      case 'v1':
        return {
          state: 'valid',
          value: uuidV1(),
          version: uuidVersion,
          message: buildVersionMessage('Generated a', uuidVersion)
        };
      case 'v3':
        return {
          state: 'valid',
          value: uuidV3(name, namespace),
          version: uuidVersion,
          message: buildVersionMessage('Generated a', uuidVersion)
        };
      case 'v4':
        return {
          state: 'valid',
          value: uuidV4(),
          version: uuidVersion,
          message: buildVersionMessage('Generated a', uuidVersion)
        };
      case 'v5':
        return {
          state: 'valid',
          value: uuidV5(name, namespace),
          version: uuidVersion,
          message: buildVersionMessage('Generated a', uuidVersion)
        };
      case 'v7':
        return {
          state: 'valid',
          value: uuidV7(),
          version: uuidVersion,
          message: buildVersionMessage('Generated a', uuidVersion)
        };
      default:
        supportedUuidVersionSchema.parse(uuidVersion);
        return {
          state: 'error',
          message: 'An unsupported UUID version was selected.'
        };
    }
  } catch {
    return {
      state: 'error',
      message: 'The browser could not generate a UUID. Try again.'
    };
  }
}

export function validateUuidValue(input: { mode: 'validate'; value: string }): UuidProcessorResult {
  const parsed = uuidValidateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      state: 'invalid',
      message: 'Enter a UUID value to validate.',
      fieldErrors: getUuidFieldErrors(parsed.error)
    };
  }

  const candidate = parsed.data.value;
  if (!validate(candidate)) {
    return {
      state: 'invalid',
      value: candidate,
      message: 'This value is not a valid UUID.'
    };
  }

  const detectedVersion = version(candidate);
  if (!supportedUuidVersionNumbers.has(detectedVersion)) {
    return {
      state: 'invalid',
      value: candidate,
      message: `UUID version ${detectedVersion} is not supported in devswiss.tools.`
    };
  }

  const resolvedVersion = `v${detectedVersion}` as SupportedUuidVersion;
  return {
    state: 'valid',
    value: candidate,
    version: resolvedVersion,
    message: `Valid ${resolvedVersion.toUpperCase()} UUID.`
  };
}
