"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Text-to-Speech (Module 10) — a thin wrapper around the browser's
 * SpeechSynthesis API. No external services, per the PRD. Re-created
 * whenever `text` changes (e.g. the reader turns a chapter).
 */
export function useTextToSpeech(text: string) {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported]);

  // Stop speaking whenever the underlying text changes (new chapter) or the component unmounts.
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [text, isSupported]);

  const englishVoices = useMemo(() => voices.filter((v) => v.lang.toLowerCase().startsWith("en")), [voices]);
  const banglaVoices = useMemo(() => voices.filter((v) => v.lang.toLowerCase().startsWith("bn")), [voices]);

  const play = useCallback(() => {
    if (!isSupported || !text.trim()) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [isSupported, text, voices, voiceURI, rate]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  return {
    isSupported,
    voices,
    englishVoices,
    banglaVoices,
    voiceURI,
    setVoiceURI,
    rate,
    setRate,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
  };
}
