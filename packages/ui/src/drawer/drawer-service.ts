import type { ReactNode } from 'react';

import type { FeedbackTone } from '../feedback/app-feedback/index.ts';
import {
  drawerStore,
  type BannerPosition,
  type ModalPosition,
  type ToastPosition,
} from './drawer-store.ts';

// Imperative service. Call from anywhere — no props, no context, no Provider.
// Mount <ToastHost />, <BannerHost />, <ModalHost /> once at the app root.

interface SharedModalConfig {
  position?: ModalPosition;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  sticky?: boolean;
}

export interface ToastOptions {
  tone?: FeedbackTone;
  durationMs?: number;
  sticky?: boolean;
  position?: ToastPosition;
  action?: { label: string; onClick: () => void };
}

function toast(message: ReactNode, opts: ToastOptions = {}): string {
  return drawerStore.pushToast({
    tone: opts.tone ?? 'default',
    message,
    durationMs: opts.durationMs ?? 4000,
    sticky: opts.sticky ?? false,
    position: opts.position ?? 'bottom-center',
    ...(opts.action !== undefined ? { action: opts.action } : {}),
  });
}

function dismissToast(id: string): void {
  drawerStore.dismissToast(id);
}

export interface BannerOptions {
  tone?: FeedbackTone;
  description?: ReactNode;
  icon?: ReactNode;
  cta?: { label: string; onClick: () => void };
  position?: BannerPosition;
  sticky?: boolean;
  durationMs?: number;
}

function banner(title: ReactNode, opts: BannerOptions = {}): string {
  return drawerStore.pushBanner({
    tone: opts.tone ?? 'default',
    title,
    ...(opts.description !== undefined ? { description: opts.description } : {}),
    ...(opts.icon !== undefined ? { icon: opts.icon } : {}),
    ...(opts.cta !== undefined ? { cta: opts.cta } : {}),
    position: opts.position ?? 'top',
    sticky: opts.sticky ?? true,
    durationMs: opts.durationMs ?? 0,
  });
}

function dismissBanner(id: string): void {
  drawerStore.dismissBanner(id);
}

export interface ConfirmOptions extends SharedModalConfig {
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  children?: ReactNode;
  onCancel?: () => void;
}

function confirm(title: ReactNode, options: ConfirmOptions & { onConfirm: () => void }): void {
  const {
    onConfirm,
    description,
    confirmLabel,
    cancelLabel,
    destructive,
    children,
    onCancel,
    position,
    closeOnOutsideClick,
    closeOnEscape,
    sticky,
  } = options;
  drawerStore.openModal({
    kind: destructive === true ? 'danger' : 'standard',
    title,
    ...(description !== undefined ? { description } : {}),
    confirmLabel: confirmLabel ?? (destructive === true ? 'Confirm' : 'OK'),
    ...(cancelLabel !== undefined ? { cancelLabel } : {}),
    onConfirm: () => {
      drawerStore.closeModal();
      onConfirm();
    },
    ...(onCancel !== undefined
      ? {
          onCancel: () => {
            drawerStore.closeModal();
            onCancel();
          },
        }
      : {}),
    ...(children !== undefined ? { children } : {}),
    position: position ?? 'center',
    closeOnOutsideClick: closeOnOutsideClick ?? true,
    closeOnEscape: closeOnEscape ?? true,
    sticky: sticky ?? false,
  });
}

export interface CriticalOptions extends SharedModalConfig {
  description?: ReactNode;
  confirmLabel: string;
  confirmPhrase: string;
  confirmPrompt: ReactNode;
  cancelLabel?: string;
  children?: ReactNode;
  onCancel?: () => void;
}

function critical(title: ReactNode, options: CriticalOptions & { onConfirm: () => void }): void {
  const {
    onConfirm,
    description,
    confirmPhrase,
    confirmPrompt,
    confirmLabel,
    cancelLabel,
    children,
    onCancel,
    position,
    closeOnOutsideClick,
    closeOnEscape,
    sticky,
  } = options;
  drawerStore.openModal({
    kind: 'critical',
    title,
    ...(description !== undefined ? { description } : {}),
    confirmPhrase,
    confirmPrompt,
    confirmLabel,
    ...(cancelLabel !== undefined ? { cancelLabel } : {}),
    onConfirm: () => {
      drawerStore.closeModal();
      onConfirm();
    },
    ...(onCancel !== undefined
      ? {
          onCancel: () => {
            drawerStore.closeModal();
            onCancel();
          },
        }
      : {}),
    ...(children !== undefined ? { children } : {}),
    position: position ?? 'center',
    closeOnOutsideClick: closeOnOutsideClick ?? false,
    closeOnEscape: closeOnEscape ?? true,
    sticky: sticky ?? false,
  });
}

export interface CustomModalOptions extends SharedModalConfig {
  hideCloseButton?: boolean;
  onClose?: () => void;
}

function openModal(body: ReactNode, options: CustomModalOptions = {}): void {
  const { onClose, hideCloseButton, position, closeOnOutsideClick, closeOnEscape, sticky } = options;
  drawerStore.openModal({
    kind: 'custom',
    body,
    hideCloseButton: hideCloseButton ?? false,
    ...(onClose !== undefined
      ? {
          onCancel: () => {
            drawerStore.closeModal();
            onClose();
          },
        }
      : {}),
    position: position ?? 'center',
    closeOnOutsideClick: closeOnOutsideClick ?? true,
    closeOnEscape: closeOnEscape ?? true,
    sticky: sticky ?? false,
  });
}

function closeModal(): void {
  drawerStore.closeModal();
}

/**
 * DrawerService — imperative toast + banner + modal singleton for KinniJije.
 *
 *   DrawerService.toast('Saved to favourites', { tone: 'success', action: { label: 'Undo', onClick } });
 *   DrawerService.banner('You're offline', { tone: 'offline', cta: { label: 'Retry', onClick } });
 *   DrawerService.confirm('Leave cook mode?', { onConfirm, confirmLabel: 'Keep cooking' });
 *   DrawerService.critical('Delete your account?', {
 *     confirmPhrase: 'DELETE',
 *     confirmPrompt: <>Type <b>DELETE</b> to continue</>,
 *     confirmLabel: 'Delete forever', onConfirm,
 *   });
 *   DrawerService.openModal(<MyBody />, { position: 'bottom' });
 */
export const DrawerService = {
  toast,
  dismissToast,
  banner,
  dismissBanner,
  confirm,
  critical,
  openModal,
  closeModal,
};
