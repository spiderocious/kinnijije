import { useState } from 'react';
import {
  AppModal,
  AppFormModal,
  AppCriticalModal,
  AppButton,
} from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function ModalsPart() {
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState(false);
  const [crit, setCrit] = useState(false);

  return (
    <div>
      <PreviewStamp num="40" title="Modals" meta="the critical delete is the ceremony" />

      <Section
        title="open each modal"
        description="The confirm modal is the everyday 'are you sure' (no crimson). The form modal carries a body. The critical modal is account deletion — crimson border + crimson paint-shadow + typed DELETE."
      >
        <ComponentRow align="center">
          <AppButton variant="secondary" onClick={() => setConfirm(true)}>
            Leave cook mode?
          </AppButton>
          <AppButton variant="secondary" onClick={() => setForm(true)}>
            Flag a step
          </AppButton>
          <AppButton variant="crit" onClick={() => setCrit(true)}>
            Delete account
          </AppButton>
        </ComponentRow>
      </Section>

      <AppModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => setConfirm(false)}
        title="Leave cook mode?"
        description="You're on step 4 of 6 and the rice is still steaming. Your place is saved — come back anytime from the recipe."
        confirmLabel="Keep cooking"
        cancelLabel="Leave"
      />

      <AppFormModal
        open={form}
        onClose={() => setForm(false)}
        onConfirm={() => setForm(false)}
        title="Flag step 3"
        meta="PARTY JOLLOF"
        confirmLabel="Send flag"
      >
        <p className="mb-2.5">&ldquo;Fry the base until the oil floats.&rdquo; What&rsquo;s not quite right?</p>
        <div className="flex flex-col gap-2">
          {['Time is off', 'Quantity is off', 'Instruction is unclear', 'Something else'].map((r, i) => (
            <label key={r} className="flex items-center gap-2 text-[13px] font-semibold">
              <input type="radio" name="flag" defaultChecked={i === 0} /> {r}
            </label>
          ))}
        </div>
      </AppFormModal>

      <AppCriticalModal
        open={crit}
        onClose={() => setCrit(false)}
        onConfirm={() => setCrit(false)}
        title="Delete your account?"
        description="This permanently deletes your KinniJije account. There is no undo, and no 30-day grace period."
        confirmPhrase="DELETE"
        confirmPrompt={
          <>
            Type <b className="font-mono text-[var(--crit)]">DELETE</b> to continue
          </>
        }
        confirmLabel="Delete forever"
        cancelLabel="Keep my account"
      >
        <ul className="m-0 mt-3 list-none p-0">
          {['14 saved favourites', 'Your cuisine and difficulty preferences', '9 months of cooking history'].map(
            (l) => (
              <li key={l} className="flex items-baseline gap-2 py-[5px] text-[12.5px]">
                <span className="text-[11px] font-extrabold text-[var(--crit)]">✕</span>
                {l}
              </li>
            ),
          )}
        </ul>
      </AppCriticalModal>
    </div>
  );
}
