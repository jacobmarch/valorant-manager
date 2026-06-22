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
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${pillTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Small eyebrow label used above page/panel titles. Quiet by default — colour is reserved for accents. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-faint ${className}`}>{children}</p>
  );
}

/** Vertical team-identity bar, coloured from a team's palette. The primary way teams are marked across the UI. */
export function TeamSpine({ colors, className = 'h-8 w-1' }: { colors?: { primary: string; secondary: string }; className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full ${className}`}
      style={{ background: colors ? `linear-gradient(${colors.primary}, ${colors.secondary})` : 'var(--color-surface-3)' }}
    />
  );
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
  const base = 'rounded-lg border border-border bg-surface';
  const hover = onClick || interactive ? 'text-left transition-colors hover:border-border-strong hover:bg-surface-2' : '';

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
        <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
      </div>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-3 hover:text-ink"
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
    <div className="rounded-md border border-line bg-surface-2 px-3 py-3 text-center">
      <p className={`font-display tnum text-2xl font-bold ${valueTone}`}>{value}</p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-faint">{label}</p>
      {hint && <p className="text-[0.65rem] text-faint">{hint}</p>}
    </div>
  );
}

type ButtonVariant = 'primary' | 'ghost' | 'subtle';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-valorant text-white hover:bg-valorant-bright',
  ghost: 'border border-border bg-surface-2 text-ink hover:border-border-strong hover:bg-surface-3',
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
      className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${buttonVariants[variant]} ${className}`}
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
          className={`flex h-5 w-5 items-center justify-center rounded text-[0.65rem] font-bold ${
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
    <span className={`tnum font-semibold ${tone}`}>
      {sign}
      {value}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}

function attributeBarColor(value: number): string {
  if (value >= 80) return 'bg-positive';
  if (value >= 60) return 'bg-valorant';
  if (value >= 40) return 'bg-gold';
  return 'bg-negative';
}

/** Labelled 0–100 attribute with a coloured fill. */
export function AttributeBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="tnum font-semibold text-ink">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={`h-full rounded-full ${attributeBarColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Morale/fatigue style meter where the healthy direction depends on the metric. */
export function ConditionMeter({ label, value, tone }: { label: string; value: number; tone: 'good-high' | 'good-low' }) {
  const healthy = tone === 'good-high' ? value >= 60 : value <= 40;
  return (
    <div className="rounded-md bg-surface-2 px-2.5 py-2">
      <p className="text-[0.6rem] uppercase tracking-wider text-faint">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className={`h-full rounded-full ${healthy ? 'bg-positive' : 'bg-negative'}`} style={{ width: `${value}%` }} />
        </div>
        <span className="tnum text-xs font-semibold">{value}</span>
      </div>
    </div>
  );
}

/**
 * Shared modal shell: dim backdrop, click-outside to dismiss, sticky header.
 * Escape handling is owned by the DrilldownProvider so stacked modals dismiss one at a time.
 */
export function Modal({
  onClose,
  eyebrow,
  title,
  spine,
  children,
  size = 'lg'
}: {
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  spine?: { primary: string; secondary: string };
  children: ReactNode;
  size?: 'md' | 'lg';
}) {
  const maxWidth = size === 'md' ? 'max-w-md' : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={`my-auto w-full ${maxWidth} overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-line bg-surface-2 p-5">
          {spine && <TeamSpine colors={spine} className="h-10 w-1.5" />}
          <div className="min-w-0 flex-1">
            {eyebrow && <div className="mb-1">{eyebrow}</div>}
            <h2 className="font-display text-xl font-bold leading-tight">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded px-2 py-1 text-lg font-bold text-faint transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
