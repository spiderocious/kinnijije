import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../utils/cn.ts';
import { AppButton } from '../../primitives/app-button/index.ts';
import { AppInput } from '../../primitives/app-field/index.ts';
import { AppPill } from '../../data/app-pill/index.ts';

// Modals — the critical delete is the ceremony. Standard confirms get the pane
// treatment; critical gets a crimson border + crimson paint-shadow (the only
// non-ink shadow in the system) + typed confirmation. The safe action gets
// equal width and first position. Spec: 40-modals.html.
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

interface SharedModalConfig {
  readonly position?: ModalPosition;
  readonly closeOnOutsideClick?: boolean;
  readonly closeOnEscape?: boolean;
  readonly sticky?: boolean;
}

const POSITION_ALIGN: Record<ModalPosition, string> = {
  center: 'items-center justify-center p-6',
  top: 'items-start justify-center p-6',
  bottom: 'items-end justify-center p-6',
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
};

const POSITION_PANEL: Record<ModalPosition, string> = {
  center: 'w-full max-w-[340px] rounded-card',
  top: 'w-full max-w-[480px] rounded-card',
  bottom: 'w-full max-w-[480px] rounded-card',
  left: 'h-full w-full max-w-[360px] overflow-y-auto',
  right: 'h-full w-full max-w-[360px] overflow-y-auto',
};

interface ModalShellProps extends SharedModalConfig {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly role?: 'dialog' | 'alertdialog';
  readonly className?: string;
  readonly children: ReactNode;
}

function ModalShell({
  open,
  onClose,
  role = 'dialog',
  position = 'center',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  sticky = false,
  className,
  children,
}: ModalShellProps) {
  useEffect(() => {
    if (!open || sticky || !closeOnEscape) return undefined;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, sticky, closeOnEscape, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const handleScrim = () => {
    if (sticky || !closeOnOutsideClick) return;
    onClose();
  };
  const stop = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return createPortal(
    <div
      role={role}
      aria-modal="true"
      onClick={handleScrim}
      className={cn('fixed inset-0 z-50 flex bg-[rgba(34,26,18,0.45)]', POSITION_ALIGN[position])}
    >
      <div onClick={stop} className={cn('bg-[var(--sheet)]', POSITION_PANEL[position], className)}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ── AppModal: standard confirm (the everyday "are you sure"). No crimson. ──
export interface AppModalProps extends SharedModalConfig {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly cancelLabel?: string;
  readonly children?: ReactNode;
}

export function AppModal({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancel',
  children,
  ...shared
}: AppModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      role="dialog"
      className="overflow-hidden border-2 border-[var(--ink)] shadow-paint"
      {...shared}
    >
      <div className="border-b-2 border-[var(--ink)] px-[18px] py-3.5">
        <span className="font-display text-[20px] uppercase tracking-display">{title}</span>
      </div>
      <div className="px-[18px] py-4 text-[13px] leading-relaxed text-[var(--ink-2)]">
        {description}
        {children}
      </div>
      <div className="flex gap-2.5 border-t border-[var(--hair)] px-[18px] pb-4 pt-3.5">
        <AppButton variant="primary" className="flex-1" onClick={onConfirm}>
          {confirmLabel}
        </AppButton>
        <AppButton variant="ghost" onClick={onClose}>
          {cancelLabel}
        </AppButton>
      </div>
    </ModalShell>
  );
}

// ── AppFormModal: a standard modal whose body is the action (flag a step). ──
export interface AppFormModalProps extends SharedModalConfig {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly meta?: ReactNode;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly cancelLabel?: string;
  readonly children: ReactNode;
}

export function AppFormModal({
  open,
  onClose,
  title,
  meta,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancel',
  children,
  ...shared
}: AppFormModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      role="dialog"
      className="overflow-hidden border-2 border-[var(--ink)] shadow-paint"
      {...shared}
    >
      <div className="flex items-baseline gap-2.5 border-b-2 border-[var(--ink)] px-[18px] py-3.5">
        <span className="font-display text-[20px] uppercase tracking-display">{title}</span>
        {meta !== undefined ? (
          <span className="ml-auto font-mono text-[10px] text-[var(--ink-3)]">{meta}</span>
        ) : null}
      </div>
      <div className="px-[18px] py-4 text-[13px] leading-relaxed text-[var(--ink-2)]">{children}</div>
      <div className="flex gap-2.5 border-t border-[var(--hair)] px-[18px] pb-4 pt-3.5">
        <AppButton variant="primary" className="flex-1" onClick={onConfirm}>
          {confirmLabel}
        </AppButton>
        <AppButton variant="ghost" onClick={onClose}>
          {cancelLabel}
        </AppButton>
      </div>
    </ModalShell>
  );
}

// ── AppCriticalModal: irreversible, type-to-confirm. Crimson everything. ──
export interface AppCriticalModalProps extends SharedModalConfig {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly confirmPhrase: string;
  readonly confirmPrompt: ReactNode;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly cancelLabel?: string;
  readonly children?: ReactNode;
}

export function AppCriticalModal({
  open,
  onClose,
  title,
  description,
  confirmPhrase,
  confirmPrompt,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Keep it',
  children,
  closeOnOutsideClick = false,
  ...shared
}: AppCriticalModalProps) {
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const matched = typed === confirmPhrase;

  useEffect(() => {
    if (open) {
      setTyped('');
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      role="alertdialog"
      closeOnOutsideClick={closeOnOutsideClick}
      className="overflow-hidden border-2 border-[var(--crit)] shadow-paint-crit"
      {...shared}
    >
      <div className="flex items-baseline gap-2.5 border-b-2 border-[var(--crit)] px-[18px] py-3.5">
        <span className="font-display text-[20px] uppercase tracking-display text-[var(--crit)]">
          {title}
        </span>
        <AppPill tone="crit" className="ml-auto">
          Deletes forever
        </AppPill>
      </div>
      <div className="px-[18px] py-4 text-[13px] leading-relaxed text-[var(--ink-2)]">
        {description}
        {children}
        <div className="mt-3">
          <div className="mb-1.5 text-[11.5px] font-bold">{confirmPrompt}</div>
          <AppInput
            ref={inputRef}
            mono
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmPhrase}
            className={matched ? 'border-[var(--crit)]' : 'border-[var(--crit-edge)]'}
          />
        </div>
      </div>
      <div className="flex gap-2.5 border-t border-[var(--hair)] px-[18px] pb-4 pt-3.5">
        <AppButton variant="secondary" className="flex-1" onClick={onClose}>
          {cancelLabel}
        </AppButton>
        <AppButton variant="crit-solid" className="flex-1" disabled={!matched} onClick={onConfirm}>
          {confirmLabel}
        </AppButton>
      </div>
    </ModalShell>
  );
}

// ── AppCustomModal: arbitrary body; service provides scrim + close. ──
export interface AppCustomModalProps extends SharedModalConfig {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly hideCloseButton?: boolean;
  readonly className?: string;
}

export function AppCustomModal({
  open,
  onClose,
  children,
  hideCloseButton = false,
  className,
  sticky,
  ...shared
}: AppCustomModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      role="dialog"
      className={cn('overflow-hidden border-2 border-[var(--ink)] shadow-paint', className)}
      {...(sticky !== undefined ? { sticky } : {})}
      {...shared}
    >
      {hideCloseButton || sticky === true ? null : (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-7 w-7 cursor-pointer place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--sheet)] text-[12px] font-bold text-[var(--ink)]"
        >
          ×
        </button>
      )}
      <div className="relative p-4">{children}</div>
    </ModalShell>
  );
}
