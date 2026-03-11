import { bcryptToolSchema, getBcryptFieldErrors } from '@/lib/validation/bcrypt';

describe('Bcrypt schema', () => {
  it('accepts valid plain text and rounds within range', () => {
    const parsed = bcryptToolSchema.safeParse({
      inputValue: 'correct horse battery staple',
      rounds: '12'
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    expect(parsed.data.rounds).toBe(12);
    expect(parsed.data.inputValue).toBe('correct horse battery staple');
  });

  it('rejects blank plain text with an actionable error', () => {
    const parsed = bcryptToolSchema.safeParse({
      inputValue: '   ',
      rounds: '12'
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const fieldErrors = getBcryptFieldErrors(parsed.error);
    expect(fieldErrors.inputValue?.[0]).toContain('Plain text is required');
  });

  it('rejects rounds outside the supported range', () => {
    const parsed = bcryptToolSchema.safeParse({
      inputValue: 'local-only password',
      rounds: '21'
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const fieldErrors = getBcryptFieldErrors(parsed.error);
    expect(fieldErrors.rounds?.[0]).toContain('Rounds must be between 1 and 20');
  });
});
