import type { ReactNode } from 'react';

import styles from './form-field.module.css';

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  labelSuffix?: ReactNode;
  required?: boolean;
};

export function FormField({
  children,
  error,
  hint,
  htmlFor,
  label,
  labelSuffix,
  required = false
}: Readonly<FormFieldProps>) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required ? <span className={styles.required}> *</span> : null}
        </label>
        {labelSuffix}
      </div>
      <div className={styles.content} data-field-descriptions={describedBy}>
        {children}
      </div>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
