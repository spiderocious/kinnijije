import { DrawerService, AppButton, AppCallout, AppToast, AppBanner } from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function DrawerDemoPart() {
  return (
    <div>
      <PreviewStamp num="41" title="Feedback · DrawerService" meta="ink slips · cream strips · imperative" />

      <Section
        title="toasts (imperative)"
        description="Ink slips with yellow accents, slid up from the bottom, 4s, swipeable. Any destructive-ish action ships with Undo. Success never uses green."
      >
        <ComponentRow align="center">
          <AppButton
            variant="secondary"
            onClick={() => DrawerService.toast('Saved to favourites', { tone: 'success', action: { label: 'Undo', onClick: () => undefined } })}
          >
            Success + Undo
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={() => DrawerService.toast('Flag sent — thank you, a person will check it', { tone: 'success' })}
          >
            Plain success
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={() => DrawerService.toast('Network down — favourites still work', { sticky: true, position: 'top-right', tone: 'warn' })}
          >
            Sticky · top-right
          </AppButton>
        </ComponentRow>
      </Section>

      <Section title="banners (imperative)" description="Cream/sienna strips pinned at the top. Sienna for offline, danfo tint for the install nudge.">
        <ComponentRow align="center">
          <AppButton
            variant="secondary"
            onClick={() => DrawerService.banner("You're offline — new suggestions need network.", { tone: 'offline', cta: { label: 'Retry', onClick: () => undefined } })}
          >
            Offline banner
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={() => DrawerService.banner('Add KinniJije to your home screen', { tone: 'install', description: 'one tap from fridge to food.', cta: { label: 'Install', onClick: () => undefined } })}
          >
            Install banner
          </AppButton>
        </ComponentRow>
      </Section>

      <Section title="modals (imperative)" description="confirm / destructive confirm / critical type-to-confirm / custom body.">
        <ComponentRow align="center">
          <AppButton variant="secondary" onClick={() => DrawerService.confirm('Leave cook mode?', { description: 'Your place is saved.', confirmLabel: 'Keep cooking', cancelLabel: 'Leave', onConfirm: () => undefined })}>
            confirm()
          </AppButton>
          <AppButton variant="secondary" onClick={() => DrawerService.confirm('Remove this favourite?', { destructive: true, confirmLabel: 'Remove', onConfirm: () => DrawerService.toast('Removed', { action: { label: 'Undo', onClick: () => undefined } }) })}>
            destructive
          </AppButton>
          <AppButton variant="crit" onClick={() => DrawerService.critical('Delete your account?', { description: 'No undo, no grace period.', confirmPhrase: 'DELETE', confirmPrompt: <>Type <b className="font-mono text-[var(--crit)]">DELETE</b> to continue</>, confirmLabel: 'Delete forever', onConfirm: () => undefined })}>
            critical()
          </AppButton>
          <AppButton variant="secondary" onClick={() => DrawerService.openModal(<div className="font-display text-[22px] tracking-display">A custom body</div>, { position: 'bottom' })}>
            custom (bottom sheet)
          </AppButton>
        </ComponentRow>
      </Section>

      <Section title="presentational pieces" description="The toast/banner/callout components the hosts render. Useful inline too.">
        <div className="max-w-[420px] space-y-3">
          <AppToast tone="success" action={{ label: 'Undo', onClick: () => undefined }}>
            Saved to favourites
          </AppToast>
          <AppBanner tone="offline" title="You're offline" description="favourites still work, new suggestions need network." cta={{ label: 'Retry', onClick: () => undefined }} />
          <AppCallout>
            <b>While the rice steams:</b> the plantain fries best in oil hot enough to sizzle a drop
            of water. Test before the first finger goes in.
          </AppCallout>
        </div>
      </Section>
    </div>
  );
}
