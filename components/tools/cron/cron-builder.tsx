'use client';

import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import type { FieldErrors } from '@/lib/validation/common';
import { cronFieldOptions, type CronDraft, type CronFieldCount, type CronFieldKey } from '@/lib/validation/cron';

import styles from './cron-builder.module.css';

type CronBuilderProps = {
  draft: CronDraft;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  onFieldCountChange: (fieldCount: CronFieldCount) => void;
  onFieldChange: (field: CronFieldKey, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function describedBy(fieldId: string, error?: string) {
  return [`${fieldId}-hint`, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function CronBuilder({
  draft,
  fieldErrors,
  isSubmitting,
  onFieldCountChange,
  onFieldChange,
  onSubmit
}: Readonly<CronBuilderProps>) {
  const isSixField = draft.fieldCount === '6';

  return (
    <>
      <div className={styles.panelHeader}>
        <div className="section-heading">
          <span className="section-eyebrow">Cron builder</span>
          <h2>Build a 5-field or 6-field cron expression</h2>
          <p className="section-copy">
            Choose whether to include seconds, then fill each cron field from guided options.
            devswiss.tools validates incomplete or conflicting choices before generating an expression.
          </p>
        </div>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.modeControl}>
          <FormField
            hint="Choose 5 fields for standard cron output or 6 fields when your scheduler includes seconds."
            htmlFor="cron-field-count"
            label="Expression format"
            required
          >
            <select
              aria-describedby={describedBy('cron-field-count')}
              id="cron-field-count"
              onChange={(event) => onFieldCountChange(event.target.value as CronFieldCount)}
              value={draft.fieldCount}
            >
              <option value="5">5 fields (minute hour day-of-month month day-of-week)</option>
              <option value="6">6 fields (seconds minute hour day-of-month month day-of-week)</option>
            </select>
          </FormField>
        </div>

        <div className={styles.grid}>
          {isSixField ? (
            <FormField
              error={fieldErrors.seconds?.[0]}
              hint='Set the seconds field (0-59). Use "*" for any second.'
              htmlFor="cron-seconds"
              label="Seconds"
              required
            >
              <select
                aria-describedby={describedBy('cron-seconds', fieldErrors.seconds?.[0])}
                id="cron-seconds"
                onChange={(event) => onFieldChange('seconds', event.target.value)}
                value={draft.seconds}
              >
                <option value="">Select seconds</option>
                {cronFieldOptions.seconds.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}

          <FormField
            error={fieldErrors.minutes?.[0]}
            hint={`Set the minutes field (0-59). Use "*" for any minute${isSixField ? '' : ' in a 5-field expression'}.`}
            htmlFor="cron-minutes"
            label="Minutes"
            required
          >
            <select
              aria-describedby={describedBy('cron-minutes', fieldErrors.minutes?.[0])}
              id="cron-minutes"
              onChange={(event) => onFieldChange('minutes', event.target.value)}
              value={draft.minutes}
            >
              <option value="">Select minutes</option>
              {cronFieldOptions.minutes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            error={fieldErrors.hours?.[0]}
            hint={`Set the hours field (0-23). A fixed hour plus "*" minutes${isSixField ? ' and "*" seconds' : ''} means the whole hour, not a single run.`}
            htmlFor="cron-hours"
            label="Hours"
            required
          >
            <select
              aria-describedby={describedBy('cron-hours', fieldErrors.hours?.[0])}
              id="cron-hours"
              onChange={(event) => onFieldChange('hours', event.target.value)}
              value={draft.hours}
            >
              <option value="">Select hours</option>
              {cronFieldOptions.hours.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            error={fieldErrors.dayOfMonth?.[0]}
            hint='Use "*" to leave this field open when day-of-week is specific.'
            htmlFor="cron-day-of-month"
            label="Day of month"
            required
          >
            <select
              aria-describedby={describedBy('cron-day-of-month', fieldErrors.dayOfMonth?.[0])}
              id="cron-day-of-month"
              onChange={(event) => onFieldChange('dayOfMonth', event.target.value)}
              value={draft.dayOfMonth}
            >
              <option value="">Select day of month</option>
              {cronFieldOptions.dayOfMonth.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            error={fieldErrors.month?.[0]}
            hint='Set the month field (1-12). Use "*" for any month.'
            htmlFor="cron-month"
            label="Month"
            required
          >
            <select
              aria-describedby={describedBy('cron-month', fieldErrors.month?.[0])}
              id="cron-month"
              onChange={(event) => onFieldChange('month', event.target.value)}
              value={draft.month}
            >
              <option value="">Select month</option>
              {cronFieldOptions.month.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            error={fieldErrors.dayOfWeek?.[0]}
            hint='Use "*" to leave this field open when day-of-month is specific.'
            htmlFor="cron-day-of-week"
            label="Day of week"
            required
          >
            <select
              aria-describedby={describedBy('cron-day-of-week', fieldErrors.dayOfWeek?.[0])}
              id="cron-day-of-week"
              onChange={(event) => onFieldChange('dayOfWeek', event.target.value)}
              value={draft.dayOfWeek}
            >
              <option value="">Select day of week</option>
              {cronFieldOptions.dayOfWeek.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button type="submit">
            {isSubmitting ? 'Generating...' : 'Generate cron expression'}
          </Button>
        </div>
      </form>
    </>
  );
}
