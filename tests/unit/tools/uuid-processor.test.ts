import { v5 as uuidV5 } from 'uuid';

import { defaultUuidNamespace, generateUuid, validateUuidValue } from '@/lib/tools/processors/uuid';

describe('UUID processor', () => {
  it('generates a version 4 UUID', () => {
    const result = generateUuid({
      mode: 'generate',
      version: 'v4'
    });

    expect(result.state).toBe('valid');
    expect(result.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('requires namespace and name for version 5 generation', () => {
    const result = generateUuid({
      mode: 'generate',
      version: 'v5',
      namespace: '',
      name: ''
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.namespace?.[0]).toContain('Namespace is required');
    expect(result.fieldErrors?.name?.[0]).toContain('Name is required');
  });

  it('validates supported UUID versions', () => {
    const candidate = uuidV5('devswiss.tools', defaultUuidNamespace);
    const result = validateUuidValue({
      mode: 'validate',
      value: candidate
    });

    expect(result.state).toBe('valid');
    expect(result.version).toBe('v5');
    expect(result.message).toContain('Valid V5 UUID');
  });
});
