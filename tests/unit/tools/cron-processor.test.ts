import { buildCronExpression, explainCronExpression } from '@/lib/tools/processors/cron';

describe('Cron processor', () => {
  it('builds a six-field cron expression with a readable summary', () => {
    const result = buildCronExpression({
      fieldCount: '6',
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

  it('builds a five-field cron expression with a readable summary', () => {
    const result = buildCronExpression({
      fieldCount: '5',
      seconds: '',
      minutes: '*/15',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('*/15 * * * *');
    expect(result.humanSummary).toContain('Every 15 minutes');
  });

  it('summarizes a fixed daily time without wildcard filler', () => {
    const result = buildCronExpression({
      fieldCount: '6',
      seconds: '0',
      minutes: '0',
      hours: '0',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('0 0 0 * * *');
    expect(result.humanSummary).toBe('Every day at 12:00:00 AM');
  });

  it('summarizes a fixed daily time in five-field mode without seconds', () => {
    const result = buildCronExpression({
      fieldCount: '5',
      seconds: '',
      minutes: '0',
      hours: '0',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('0 0 * * *');
    expect(result.humanSummary).toBe('Every day at 12:00 AM');
  });

  it('clarifies that wildcard minutes and seconds cover the whole fixed hour', () => {
    const result = buildCronExpression({
      fieldCount: '6',
      seconds: '*',
      minutes: '*',
      hours: '12',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('* * 12 * * *');
    expect(result.humanSummary).toBe('Every second during the 12:00 PM hour every day');
  });

  it('clarifies that wildcard minutes cover the whole fixed hour in five-field mode', () => {
    const result = buildCronExpression({
      fieldCount: '5',
      seconds: '',
      minutes: '*',
      hours: '12',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('* 12 * * *');
    expect(result.humanSummary).toBe('Every minute during the 12:00 PM hour every day');
  });

  it('returns field errors when the draft is incomplete', () => {
    const result = buildCronExpression({
      fieldCount: '6',
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
      fieldCount: '6',
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

  it('explains a valid five-field cron expression', () => {
    const result = explainCronExpression('  */15   *  * * *  ');

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('*/15 * * * *');
    expect(result.humanSummary).toContain('Every 15 minutes');
  });

  it('explains a valid six-field cron expression', () => {
    const result = explainCronExpression('0 0 0 * * *');

    expect(result.state).toBe('valid');
    expect(result.expression).toBe('0 0 0 * * *');
    expect(result.humanSummary).toBe('Every day at 12:00:00 AM');
  });

  it('returns a field error when the raw expression is empty', () => {
    const result = explainCronExpression('   ');

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.expression?.[0]).toBe('Cron expression is required.');
  });

  it('rejects a raw expression with an unsupported field count', () => {
    const result = explainCronExpression('* * * *');

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.expression?.[0]).toBe('Cron expression must use 5 fields or 6 fields.');
  });

  it('returns an error state when a five-field or six-field expression cannot be interpreted', () => {
    const result = explainCronExpression('99 * * * *');

    expect(result.state).toBe('error');
    expect(result.message).toContain('could not be interpreted');
  });
});
