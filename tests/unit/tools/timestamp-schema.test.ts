import { timestampExplainSchema, timestampGenerateSchema } from '@/lib/validation/timestamp';

describe('Timestamp validation schemas', () => {
  it('accepts signed integer timestamp input with auto unit detection', () => {
    const parsed = timestampExplainSchema.safeParse({
      rawTimestamp: '-1712297105',
      inputUnit: 'auto'
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects malformed timestamp input', () => {
    const parsed = timestampExplainSchema.safeParse({
      rawTimestamp: '17.12',
      inputUnit: 'seconds'
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.rawTimestamp).toContain(
      'Timestamp must be a signed whole number in seconds or milliseconds.'
    );
  });

  it('accepts browser date-time values with timezone and output unit selections', () => {
    const parsed = timestampGenerateSchema.safeParse({
      dateTime: '2024-04-05T12:34:56',
      timezone: 'utc',
      outputUnit: 'milliseconds'
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects incomplete date-time input', () => {
    const parsed = timestampGenerateSchema.safeParse({
      dateTime: '',
      timezone: 'local',
      outputUnit: 'seconds'
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.dateTime).toContain('Date and time is required.');
  });
});
