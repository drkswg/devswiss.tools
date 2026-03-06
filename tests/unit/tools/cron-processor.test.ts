import { buildCronExpression } from '@/lib/tools/processors/cron';

describe('Cron processor', () => {
  it('builds a six-field cron expression with a readable summary', () => {
    const result = buildCronExpression({
      seconds: '0',
      minutes: '*/15',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('0 */15 * * * *');
    expect(result.humanSummary).toContain('Every 15 minutes');
  });

  it('returns field errors when the draft is incomplete', () => {
    const result = buildCronExpression({
      seconds: '',
      minutes: '*/15',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.seconds?.[0]).toContain('Seconds is required');
  });

  it('returns actionable errors for conflicting day selectors', () => {
    const result = buildCronExpression({
      seconds: '0',
      minutes: '0',
      hours: '9',
      dayOfMonth: '15',
      month: '*',
      dayOfWeek: '1-5'
    });

    expect(result.state).toBe('invalid');
    expect(result.errors?.some((value) => value.includes('Choose either day of month or day of week'))).toBe(true);
  });
});
