import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'positive' | 'negative' | 'gold';

const pillTones: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-muted',
  accent: 'bg-valorant/15 text-valorant-bright',
  positive: 'bg-positive/15 text-positive',
  negative: 'bg-negative/15 text-negative',
  gold: 'bg-gold/15 text-gold'
};

export function Pill({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider ${pillTones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Small eyebrow label used above page/panel titles. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-valorant ${className}`}>{children}</p>;
}

/** Base elevated container. Pass `as="button"`/onClick to make it an interactive drill-in card. */
export function Card({
  children,
  className = '',
  onClick,
  interactive
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const base = 'rounded-2xl border border-border bg-surface';
  const hover = onClick || interactive ? 'text-left transition hover:border-valorant/50 hover:bg-surface-2' : '';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${hover} ${className}`}>
        {children}
      </button>
    );
  }

  return <div className={`${base} ${hover} ${className}`}>{children}</div>;
}

/** Panel title row with an optional "view all" drill-in action on the right. */
export function PanelHeader({
  title,
  subtitle,
  action,
  onAction
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-black tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
      </div>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold text-muted transition hover:bg-surface-3 hover:text-ink"
        >
          {action} →
        </button>
      )}
    </div>
  );
}

/** A labelled metric. `tone` colours the value for diffs/records. */
export function StatTile({
  label,
  value,
  tone = 'neutral',
  hint
}: {
  label: string;
  value: ReactNode;
  tone?: 'neutral' | 'positive' | 'negative' | 'accent';
  hint?: string;
}) {
  const valueTone =
    tone === 'positive' ? 'text-positive' : tone === 'negative' ? 'text-negative' : tone === 'accent' ? 'text-valorant-bright' : 'text-ink';
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-3 text-center">
      <p className={`tnum text-2xl font-black ${valueTone}`}>{value}</p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-faint">{label}</p>
      {hint && <p className="text-[0.65rem] text-faint">{hint}</p>}
    </div>
  );
}

type ButtonVariant = 'primary' | 'ghost' | 'subtle';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-valorant text-white shadow-lg shadow-valorant/20 hover:bg-valorant-bright',
  ghost: 'border border-border bg-surface-2 text-ink hover:border-valorant/50 hover:bg-surface-3',
  subtle: 'bg-surface-3 text-ink hover:bg-border'
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Win/loss form streak chips, most recent last. */
export function FormStreak({ form }: { form: Array<'W' | 'L'> }) {
  if (form.length === 0) {
    return <span className="text-xs text-faint">No games</span>;
  }
  return (
    <div className="flex gap-1">
      {form.map((outcome, index) => (
        <span
          key={index}
          className={`flex h-5 w-5 items-center justify-center rounded text-[0.65rem] font-black ${
            outcome === 'W' ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'
          }`}
        >
          {outcome}
        </span>
      ))}
    </div>
  );
}

/** Coloured signed number for differentials (+/-). */
export function Diff({ value, suffix }: { value: number; suffix?: string }) {
  const tone = value > 0 ? 'text-positive' : value < 0 ? 'text-negative' : 'text-muted';
  const sign = value > 0 ? '+' : '';
  return (
    <span className={`tnum font-bold ${tone}`}>
      {sign}
      {value}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}
