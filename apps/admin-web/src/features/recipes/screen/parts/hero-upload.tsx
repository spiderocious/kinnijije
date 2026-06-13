import { useRef, useState } from 'react';
import { Show } from 'meemaw';

import { fileService } from '@kinnijije/api';
import type { Recipe } from '@kinnijije/core';
import { AppButton, AppText, DrawerService } from '@kinnijije/ui';
import { IconSnap } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useSetRecipeHero } from '../../api/use-recipes.ts';

// Hero image: upload a file straight to R2 via the file-service (presigned PUT),
// then attach the returned key to the recipe. The backend stores only the key.
export function HeroUpload({ recipe }: { recipe: Recipe }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const setHero = useSetRecipeHero(recipe.id);
  const [uploading, setUploading] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onFile = async (file: File) => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    setUploading(true);
    try {
      const key = await fileService.upload(file, ext);
      await setHero.mutateAsync({ key, kind: 'photo' });
      DrawerService.toast('Hero image updated', { tone: 'success' });
    } catch (err) {
      DrawerService.toast(errorMessage(err, 'Upload failed'), { tone: 'warn' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-card border-2 border-[var(--hair-2)] bg-[var(--paper)] p-3">
      <AppText variant="caption">Hero image</AppText>
      <div className="mt-2 flex items-center gap-3">
        <img
          src={recipe.heroImageUrl}
          alt={`Current hero for ${recipe.name}`}
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 rounded-ctrl border-2 border-[var(--ink)] object-cover"
        />
        <div className="min-w-0">
          <AppText variant="body-sm" className="text-[var(--ink-3)]">
            {recipe.heroImageKind === 'placeholder'
              ? 'Using the placeholder — upload a real photo.'
              : 'Custom image attached.'}
          </AppText>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            leadingIcon={<IconSnap size={15} />}
            loading={uploading}
            disabled={uploading}
            onClick={onPick}
            className="mt-2"
          >
            Upload image
          </AppButton>
        </div>
      </div>
      <Show when={setHero.isError}>
        <p role="alert" className="mt-2 text-[11.5px] font-semibold text-[var(--warn)]">
          {errorMessage(setHero.error)}
        </p>
      </Show>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
