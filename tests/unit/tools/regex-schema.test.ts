import { MAX_TOOL_INPUT_CHARACTERS } from '@/lib/validation/common';
import { regexSchema } from '@/lib/validation/regex';

describe('Regex validation schema', () => {
  it('accepts Java and PL/SQL drafts within the shared free-text limits', () => {
    const parsed = regexSchema.safeParse({
      flavor: 'java',
      expression: '^(\\w+)$',
      sampleText: 'alpha'
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects a blank expression', () => {
    const parsed = regexSchema.safeParse({
      flavor: 'plsql',
      expression: '   ',
      sampleText: 'alpha'
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.expression).toContain('Regex expression is required.');
  });

  it('rejects input beyond the shared free-text limit', () => {
    const parsed = regexSchema.safeParse({
      flavor: 'java',
      expression: 'a',
      sampleText: 'x'.repeat(MAX_TOOL_INPUT_CHARACTERS + 1)
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.sampleText).toContain(
      `Sample text must stay under ${MAX_TOOL_INPUT_CHARACTERS.toLocaleString()} characters.`
    );
  });
});
