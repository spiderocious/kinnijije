import { useRef, useState } from 'react';
import { Show } from 'meemaw';

import { fileService } from '@kinnijije/api';
import { AppText, AppVoiceCapture } from '@kinnijije/ui';
import { IconVoice } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useExtractVoice } from '../../api/use-ingredients.ts';

type Phase = 'idle' | 'recording' | 'uploading' | 'error';

// Voice method: hold to record (familiar from WhatsApp), release to transcribe.
// The audio uploads to R2 first, then the key goes to the voice-extract endpoint
// (Whisper + parse). Extracted ingredients flow into the session.
export function VoiceMethod({ onAdd }: { onAdd: (items: string[]) => void }) {
  const extract = useExtractVoice();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    setError('');
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void handleStop();
      recorder.start();
      recorderRef.current = recorder;
      setPhase('recording');
    } catch {
      setError('Microphone access is needed to record. You can also type instead.');
      setPhase('error');
    }
  };

  const stop = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const handleStop = async () => {
    setPhase('uploading');
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const key = await fileService.upload(blob, 'webm');
      const result = await extract.mutateAsync(key);
      setTranscript(result.transcript);
      onAdd(result.ingredients);
      setPhase('idle');
    } catch (err) {
      setError(errorMessage(err, 'Could not read that. Try again or type instead.'));
      setPhase('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <AppVoiceCapture
        micIcon={<IconVoice size={22} aria-hidden="true" />}
        {...(transcript.length > 0 ? { transcript } : {})}
        onHoldStart={() => void start()}
        onHoldEnd={stop}
      />
      <Show when={phase === 'uploading'}>
        <AppText variant="body-sm" className="text-[var(--ink-3)]">
          Listening…
        </AppText>
      </Show>
      <Show when={phase === 'error'}>
        <p role="alert" className="text-center text-[12.5px] font-semibold text-[var(--warn)]">
          {error}
        </p>
      </Show>
    </div>
  );
}
