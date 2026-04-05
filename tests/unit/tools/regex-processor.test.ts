import { analyzeRegex } from '@/lib/tools/processors/regex';

describe('Regex processor', () => {
  it('explains and executes a Java pattern with inline flags and capture groups', () => {
    const result = analyzeRegex({
      flavor: 'java',
      expression: '(?i)^([a-z]{3})-(\\d+)$',
      sampleText: 'ABC-42'
    });

    expect(result.state).toBe('valid');
    expect(result.message).toContain('matched against the sample text');
    expect(result.details?.summary).toBe('Java pattern with 2 groups, 2 quantifiers, 1 character class, 2 anchors.');
    expect(result.details?.execution).toMatchObject({
      supported: true,
      anyMatch: true,
      fullMatch: true,
      translatedPattern: '^([a-z]{3})-(\\d+)$',
      flags: 'i'
    });
    expect(result.details?.execution.supported && result.details.execution.matches[0]).toMatchObject({
      start: 0,
      end: 6,
      value: 'ABC-42',
      groups: [
        { index: 1, value: 'ABC' },
        { index: 2, value: '42' }
      ]
    });
  });

  it('translates supported PL/SQL POSIX classes before execution', () => {
    const result = analyzeRegex({
      flavor: 'plsql',
      expression: '([[:digit:]]{2})/[[:digit:]]{2}',
      sampleText: 'ID 12/34 OK'
    });

    expect(result.state).toBe('valid');
    expect(result.details?.execution).toMatchObject({
      supported: true,
      anyMatch: true,
      fullMatch: false,
      translatedPattern: '([0-9]{2})/[0-9]{2}',
      flags: ''
    });
    expect(result.details?.execution.supported && result.details.execution.matches[0]).toMatchObject({
      value: '12/34',
      start: 3,
      end: 8
    });
  });

  it('blocks execution for unsupported flavor-specific constructs instead of returning misleading matches', () => {
    const result = analyzeRegex({
      flavor: 'java',
      expression: '(?<=ID-)\\d++',
      sampleText: 'ID-42'
    });

    expect(result.state).toBe('valid');
    expect(result.message).toContain('exact browser execution is not available');
    expect(result.details?.execution).toEqual({
      supported: false,
      unsupportedReason: 'Lookbehind assertions are explained, but exact browser execution is blocked to avoid flavor drift.'
    });
  });

  it('returns actionable field errors for malformed expressions', () => {
    const result = analyzeRegex({
      flavor: 'java',
      expression: '([a-z]+',
      sampleText: 'abc'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.expression).toContain('One or more groups are missing a closing parenthesis.');
  });
});
