import { explainTimestamp, generateTimestamp } from '@/lib/tools/processors/timestamp';

describe('Timestamp processor', () => {
  it('explains a seconds timestamp and returns deterministic UTC output', () => {
    const result = explainTimestamp({
      rawTimestamp: '1712297105',
      inputUnit: 'auto'
    });

    expect(result.state).toBe('valid');
    expect(result.message).toBe('Timestamp explained as seconds.');
    expect(result.value).toBe('1712297105');
    expect(result.details).toMatchObject({
      resolvedUnit: 'seconds',
      utcDateTime: '2024-04-05 06:05:05 UTC',
      iso8601: '2024-04-05T06:05:05.000Z',
      epochMilliseconds: '1712297105000'
    });
  });

  it('explains an explicit milliseconds timestamp without changing the normalized value', () => {
    const result = explainTimestamp({
      rawTimestamp: '1712297105123',
      inputUnit: 'milliseconds'
    });

    expect(result.state).toBe('valid');
    expect(result.details).toMatchObject({
      resolvedUnit: 'milliseconds',
      epochMilliseconds: '1712297105123',
      iso8601: '2024-04-05T06:05:05.123Z'
    });
    expect(result.value).toBe('1712297105123');
  });

  it('returns actionable validation for malformed timestamp input', () => {
    const result = explainTimestamp({
      rawTimestamp: 'abc',
      inputUnit: 'auto'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.rawTimestamp).toContain(
      'Timestamp must be a signed whole number in seconds or milliseconds.'
    );
  });

  it('rejects out-of-range timestamps', () => {
    const result = explainTimestamp({
      rawTimestamp: '8640000000000001',
      inputUnit: 'milliseconds'
    });

    expect(result.state).toBe('error');
    expect(result.message).toContain('outside the supported JavaScript date range');
  });

  it('generates a UTC seconds timestamp from a date-time input', () => {
    const result = generateTimestamp({
      dateTime: '2024-04-05T10:05:05',
      timezone: 'utc',
      outputUnit: 'seconds'
    });

    expect(result.state).toBe('valid');
    expect(result.message).toBe('Timestamp generated in seconds.');
    expect(result.value).toBe('1712311505');
    expect(result.details).toMatchObject({
      interpretedAs: 'utc',
      outputUnit: 'seconds',
      utcDateTime: '2024-04-05 10:05:05 UTC',
      iso8601: '2024-04-05T10:05:05.000Z',
      epochMilliseconds: '1712311505000'
    });
  });

  it('generates a local milliseconds timestamp from a date-time input', () => {
    const localDate = new Date(2024, 3, 5, 10, 5, 5);

    const result = generateTimestamp({
      dateTime: '2024-04-05T10:05:05',
      timezone: 'local',
      outputUnit: 'milliseconds'
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe(String(localDate.getTime()));
    expect(result.details).toMatchObject({
      interpretedAs: 'local',
      outputUnit: 'milliseconds',
      epochMilliseconds: String(localDate.getTime()),
      iso8601: localDate.toISOString()
    });
  });

  it('rejects impossible calendar dates', () => {
    const result = generateTimestamp({
      dateTime: '2024-02-30T10:05:05',
      timezone: 'utc',
      outputUnit: 'seconds'
    });

    expect(result.state).toBe('error');
    expect(result.fieldErrors?.dateTime).toContain('This date and time cannot be represented in the selected timezone.');
  });
});
