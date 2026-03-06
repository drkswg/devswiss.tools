import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './button.module.css';

type ButtonTone = 'accent' | 'success' | 'danger' | 'neutral';
type ButtonVariant = 'solid' | 'ghost' | 'outline';

type SharedProps = {
  children: ReactNode;
  className?: string;
  tone?: ButtonTone;
  variant?: ButtonVariant;
};

type ButtonAsButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonAsLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function getClassName(className?: string) {
  return [styles.button, className].filter(Boolean).join(' ');
}

function omitSharedProps<T extends object>(props: T, extraKeys: string[] = []) {
  const omitted = new Set(['children', 'className', 'tone', 'variant', ...extraKeys]);

  return Object.fromEntries(
    Object.entries(props as Record<string, unknown>).filter(([key]) => !omitted.has(key))
  );
}

function isLinkProps(props: ButtonProps): props is ButtonAsLinkProps {
  return 'href' in props && typeof props.href === 'string';
}

export function Button(props: ButtonProps) {
  const { children, className, tone = 'accent', variant = 'solid' } = props;
  const resolvedClassName = getClassName(className);

  if (isLinkProps(props)) {
    const { href } = props;
    const linkProps = omitSharedProps(props, ['href']) as Omit<
      ButtonAsLinkProps,
      'children' | 'className' | 'href' | 'tone' | 'variant'
    >;

    return (
      <Link className={resolvedClassName} data-tone={tone} data-variant={variant} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }

  const type = props.type ?? 'button';
  const buttonProps = omitSharedProps(props, ['type']) as Omit<
    ButtonAsButtonProps,
    'children' | 'className' | 'tone' | 'type' | 'variant'
  >;

  return (
    <button
      className={resolvedClassName}
      data-tone={tone}
      data-variant={variant}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
