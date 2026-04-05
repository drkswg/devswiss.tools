import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import {
  getTimestampFieldErrors,
  timestampExplainSchema,
  timestampGenerateSchema,
  type TimestampExplainDraft,
  type TimestampGenerateDraft,
  type TimestampInputUnit,
  type TimestampOutputUnit,
  type TimestampTimezoneMode
} from '@/lib/validation/timestamp';

const MAX_DATE_MS = 8_640_000_000_000_000;
const MIN_DATE_MS = -8_640_000_000_000_000;

export type TimestampExplanationDetails = {
  epochMilliseconds: string;
  iso8601: string;
  normalizedTimestamp: string;
  resolvedUnit: Exclude<TimestampInputUnit, 'auto'>;
  utcDateTime: string;
};

export type TimestampGenerationDetails = {
  epochMilliseconds: string;
  interpretedAs: TimestampTimezoneMode;
  iso8601: string;
  outputUnit: TimestampOutputUnit;
  timestamp: string;
  utcDateTime: string;
};

export type TimestampProcessorResult = {
  details?: TimestampExplanationDetails | TimestampGenerationDetails;
  errors?: string[];
  fieldErrors?: FieldErrors;
  message: string;
  state: Exclude<ValidationState, 'idle'>;
  value?: string;
};

type ParsedDateTimeLocal = {
  day: number;
  hours: number;
  minutes: number;
  monthIndex: number;
  monthNumber: number;
  seconds: number;
  year: number;
};

function buildErrorList(fieldErrors: FieldErrors, fallbackIssues: string[]) {
  return Array.from(new Set([...Object.values(fieldErrors).flat(), ...fallbackIssues]));
}

function resolveTimestampUnit(rawTimestamp: string, inputUnit: TimestampInputUnit) {
  if (inputUnit !== 'auto') {
    return inputUnit;
  }

  const digitsOnly = rawTimestamp.replace(/^[+-]/, '');
  return digitsOnly.length > 10 ? 'milliseconds' : 'seconds';
}

function convertTimestampToMilliseconds(rawTimestamp: string, resolvedUnit: Exclude<TimestampInputUnit, 'auto'>) {
  const normalized = Number(rawTimestamp);
  const milliseconds = resolvedUnit === 'seconds' ? normalized * 1000 : normalized;

  if (!Number.isFinite(normalized) || !Number.isSafeInteger(normalized) || !Number.isSafeInteger(milliseconds)) {
    throw new RangeError('Timestamp is outside the supported JavaScript date range.');
  }

  if (milliseconds < MIN_DATE_MS || milliseconds > MAX_DATE_MS) {
    throw new RangeError('Timestamp is outside the supported JavaScript date range.');
  }

  return {
    milliseconds,
    normalizedTimestamp: normalized.toString()
  };
}

function formatUtcDateTime(date: Date) {
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

function parseDateTimeLocal(value: string): ParsedDateTimeLocal | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue, hoursValue, minutesValue, secondsValue] = match;
  const year = Number.parseInt(yearValue, 10);
  const monthNumber = Number.parseInt(monthValue, 10);
  const day = Number.parseInt(dayValue, 10);
  const hours = Number.parseInt(hoursValue, 10);
  const minutes = Number.parseInt(minutesValue, 10);
  const seconds = secondsValue ? Number.parseInt(secondsValue, 10) : 0;

  if (
    monthNumber < 1 ||
    monthNumber > 12 ||
    day < 1 ||
    day > 31 ||
    hours > 23 ||
    minutes > 59 ||
    seconds > 59
  ) {
    return null;
  }

  return {
    year,
    monthNumber,
    monthIndex: monthNumber - 1,
    day,
    hours,
    minutes,
    seconds
  };
}

function isSameUtcParts(date: Date, parts: ParsedDateTimeLocal) {
  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.monthIndex &&
    date.getUTCDate() === parts.day &&
    date.getUTCHours() === parts.hours &&
    date.getUTCMinutes() === parts.minutes &&
    date.getUTCSeconds() === parts.seconds
  );
}

function isSameLocalParts(date: Date, parts: ParsedDateTimeLocal) {
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.monthIndex &&
    date.getDate() === parts.day &&
    date.getHours() === parts.hours &&
    date.getMinutes() === parts.minutes &&
    date.getSeconds() === parts.seconds
  );
}

function buildDateFromParts(parts: ParsedDateTimeLocal, timezone: TimestampTimezoneMode) {
  const date =
    timezone === 'utc'
      ? new Date(Date.UTC(parts.year, parts.monthIndex, parts.day, parts.hours, parts.minutes, parts.seconds))
      : new Date(parts.year, parts.monthIndex, parts.day, parts.hours, parts.minutes, parts.seconds);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const matches = timezone === 'utc' ? isSameUtcParts(date, parts) : isSameLocalParts(date, parts);
  return matches ? date : null;
}

function formatOutputTimestamp(milliseconds: number, outputUnit: TimestampOutputUnit) {
  return outputUnit === 'seconds' ? String(Math.trunc(milliseconds / 1000)) : String(milliseconds);
}

export function explainTimestamp(input: TimestampExplainDraft): TimestampProcessorResult {
  const parsed = timestampExplainSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = getTimestampFieldErrors(parsed.error);
    return {
      state: 'invalid',
      message: 'Fix the highlighted timestamp input before explaining it.',
      fieldErrors,
      errors: buildErrorList(fieldErrors, parsed.error.issues.map((issue) => issue.message))
    };
  }

  try {
    const resolvedUnit = resolveTimestampUnit(parsed.data.rawTimestamp, parsed.data.inputUnit);
    const { milliseconds, normalizedTimestamp } = convertTimestampToMilliseconds(parsed.data.rawTimestamp, resolvedUnit);
    const date = new Date(milliseconds);
    const iso8601 = date.toISOString();
    const utcDateTime = formatUtcDateTime(date);

    return {
      state: 'valid',
      message: `Timestamp explained as ${resolvedUnit}.`,
      value: normalizedTimestamp,
      details: {
        resolvedUnit,
        normalizedTimestamp,
        utcDateTime,
        iso8601,
        epochMilliseconds: milliseconds.toString()
      }
    };
  } catch (error) {
    return {
      state: 'error',
      message:
        error instanceof RangeError
          ? 'This timestamp is outside the supported JavaScript date range.'
          : 'The timestamp could not be explained. Check the value and try again.',
      errors:
        error instanceof RangeError
          ? ['This timestamp is outside the supported JavaScript date range.']
          : ['The timestamp could not be explained. Check the value and try again.']
    };
  }
}

export function generateTimestamp(input: TimestampGenerateDraft): TimestampProcessorResult {
  const parsed = timestampGenerateSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = getTimestampFieldErrors(parsed.error);
    return {
      state: 'invalid',
      message: 'Fix the highlighted date and time values before generating a timestamp.',
      fieldErrors,
      errors: buildErrorList(fieldErrors, parsed.error.issues.map((issue) => issue.message))
    };
  }

  const parts = parseDateTimeLocal(parsed.data.dateTime);
  if (!parts) {
    return {
      state: 'invalid',
      message: 'Enter a complete date and time before generating a timestamp.',
      fieldErrors: {
        dateTime: ['Date and time must use the browser date-time format.']
      },
      errors: ['Date and time must use the browser date-time format.']
    };
  }

  const date = buildDateFromParts(parts, parsed.data.timezone);
  if (!date) {
    return {
      state: 'error',
      message: 'This date and time cannot be represented in the selected timezone.',
      fieldErrors: {
        dateTime: ['This date and time cannot be represented in the selected timezone.']
      },
      errors: ['This date and time cannot be represented in the selected timezone.']
    };
  }

  const milliseconds = date.getTime();
  const iso8601 = date.toISOString();
  const utcDateTime = formatUtcDateTime(date);
  const timestamp = formatOutputTimestamp(milliseconds, parsed.data.outputUnit);

  return {
    state: 'valid',
    message: `Timestamp generated in ${parsed.data.outputUnit}.`,
    value: timestamp,
    details: {
      interpretedAs: parsed.data.timezone,
      outputUnit: parsed.data.outputUnit,
      timestamp,
      utcDateTime,
      iso8601,
      epochMilliseconds: String(milliseconds)
    }
  };
}
