"use client";

import { Pause, Play, Square } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { useTranslation } from "@/hooks/use-translation";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { cn } from "@/lib/utils";

interface TtsPanelProps {
  open: boolean;
  onClose: () => void;
  /** Plain text of the current chapter — what gets read aloud. */
  text: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function TtsPanel({ open, onClose, text }: TtsPanelProps) {
  const { t } = useTranslation();
  const tts = useTextToSpeech(text);

  return (
    <Drawer open={open} onClose={onClose} title={t("reader.tts.title")} side="bottom" className="max-w-none">
      {!tts.isSupported ? (
        <p className="text-sm text-muted-foreground">{t("reader.tts.unsupported")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-4">
            {!tts.isPlaying ? (
              <button
                type="button"
                onClick={tts.play}
                aria-label={t("reader.tts.play")}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-200 hover:opacity-90"
              >
                <Play className="h-6 w-6" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={tts.isPaused ? tts.resume : tts.pause}
                aria-label={tts.isPaused ? t("reader.tts.resume") : t("reader.tts.pause")}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-200 hover:opacity-90"
              >
                {tts.isPaused ? <Play className="h-6 w-6" aria-hidden="true" /> : <Pause className="h-6 w-6" aria-hidden="true" />}
              </button>
            )}
            <button
              type="button"
              onClick={tts.stop}
              disabled={!tts.isPlaying}
              aria-label={t("reader.tts.stop")}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-secondary disabled:opacity-40"
            >
              <Square className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <section className="flex flex-col gap-2.5">
            <p className="text-sm font-bold">{t("reader.tts.voice")}</p>
            <select
              value={tts.voiceURI ?? ""}
              onChange={(event) => tts.setVoiceURI(event.target.value || null)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="">{t("reader.tts.voiceDefault")}</option>
              {tts.englishVoices.length > 0 && (
                <optgroup label={t("reader.tts.voiceEnglish")}>
                  {tts.englishVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {tts.banglaVoices.length > 0 && (
                <optgroup label={t("reader.tts.voiceBangla")}>
                  {tts.banglaVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </section>

          <section className="flex flex-col gap-2.5">
            <p className="text-sm font-bold">{t("reader.tts.speed")}</p>
            <div className="grid grid-cols-5 gap-2">
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => tts.setRate(speed)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-medium transition-colors duration-200",
                    tts.rate === speed
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
}
