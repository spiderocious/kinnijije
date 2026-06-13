import { useRef, useState } from 'react';
import { Show } from 'meemaw';

import { fileService } from '@kinnijije/api';
import { AppButton, AppText } from '@kinnijije/ui';
import { IconSnap } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useExtractPhoto } from '../../api/use-ingredients.ts';

type Phase = 'idle' | 'working' | 'error';

// Photo method: snap the fridge/shelf. Images upload to R2 first (kept, so the
// user can see what they uploaded later), then the keys go to the photo-extract
// endpoint (OpenAI Vision). Multiple photos combine. Found ingredients flow into
// the session.
export function PhotoMethod({ onAdd }: { onAdd: (items: string[]) => void }) {
  const extract = useExtractPhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');

  const onFiles = async (files: FileList) => {
    setError('');
    setPhase('working');
    try {
      const keys = await Promise.all(
        Array.from(files)
          .slice(0, 5)
          .map((file) => fileService.upload(file, file.name.split('.').pop() ?? 'jpg')),
      );
      const result = await extract.mutateAsync(keys);
      onAdd(result.ingredients);
      setPhase('idle');
    } catch (err) {
      setError(errorMessage(err, 'Could not read that photo. Try again or type instead.'));
      setPhase('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <AppButton
        type="button"
        variant="primary"
        size="lg"
        leadingIcon={<IconSnap size={20} />}
        loading={phase === 'working'}
        disabled={phase === 'working'}
        onClick={() => inputRef.current?.click()}
      >
        {phase === 'working' ? 'Reading your kitchen…' : 'Take a photo'}
      </AppButton>
      <AppText variant="body-sm" className="text-center text-[var(--ink-3)]">
        Snap your fridge, shelf or counter. You can add more than one.
      </AppText>
      <Show when={phase === 'error'}>
        <p role="alert" className="text-center text-[12.5px] font-semibold text-[var(--warn)]">
          {error}
        </p>
      </Show>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) void onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
