import { cronDraftSchema } from '@/lib/validation/cron';

describe('Cron schema', () => {
  it('accepts a valid six-field cron draft', () => {
    const parsed = cronDraftSchema.safeParse({
      fieldCount: '6',
      seconds: '0',
      minutes: '*/15',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts a valid five-field cron draft without seconds', () => {
    const parsed = cronDraftSchema.safeParse({
      fieldCount: '5',
      seconds: '',
      minutes: '*/15',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(parsed.success).toBe(true);
  });

  it('requires seconds in six-field mode', () => {
    const parsed = cronDraftSchema.safeParse({
      fieldCount: '6',
      seconds: '',
      minutes: '*/15',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const secondsError = parsed.error.issues.find((issue) => issue.path.join('.') === 'seconds');
    expect(secondsError?.message).toContain('Seconds is required');
  });

  it('flags conflicting day-of-month and day-of-week selections', () => {
    const parsed = cronDraftSchema.safeParse({
      fieldCount: '6',
      seconds: '0',
      minutes: '0',
      hours: '9',
      dayOfMonth: '15',
      month: '*',
      dayOfWeek: '1-5'
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const conflictMessages = parsed.error.issues
      .filter((issue) => ['dayOfMonth', 'dayOfWeek'].includes(issue.path.join('.')))
      .map((issue) => issue.message);

    expect(conflictMessages.some((message) => message.includes('Choose either day of month or day of week'))).toBe(
      true
    );
  });

  it('rejects out-of-range values', () => {
    const parsed = cronDraftSchema.safeParse({
      fieldCount: '5',
      seconds: '',
      minutes: '61',
      hours: '9',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const minutesError = parsed.error.issues.find((issue) => issue.path.join('.') === 'minutes');
    expect(minutesError?.message).toContain('Minutes value is invalid');
  });
});