import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Live signal URL for Radio Crepuscular 99.5 FM.
 * The stream is served over HTTPS so the browser never blocks mixed content.
 */
export const LIVE_STREAM_URL = "https://stream.zeno.fm/radiocrepuscular";

export type StreamStatus = "loading" | "live" | "offline";

export interface LiveStreamState {
  status: StreamStatus;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  errorMessage: string | null;
  togglePlay: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  retry: () => void;
}

const VOLUME_STEP = 0.01;

/**
 * Owns a single HTMLAudioElement for the live signal so playback survives
 * navigation between app sections. The element is created once and reused.
 */
export function useLiveStream(): LiveStreamState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<StreamStatus>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(LIVE_STREAM_URL);
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    return audio;
  }, []);

  // Keep the element's volume/mute in sync without recreating it, so adjusting
  // the slider never interrupts or restarts live playback.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  // Wire lifecycle events once, and tear the element down on unmount.
  useEffect(() => {
    const audio = ensureAudio();
    const handleWaiting = () => setStatus("loading");
    const handlePlaying = () => {
      setStatus("live");
      setIsPlaying(true);
      setErrorMessage(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setStatus("offline");
      setIsPlaying(false);
      setErrorMessage(
        "No pudimos conectar con la señal en vivo. Revisa tu conexión e inténtalo de nuevo.",
      );
    };
    const handleStalled = () => setStatus("loading");

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);

    return () => {
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [ensureAudio]);

  const togglePlay = useCallback(() => {
    const audio = ensureAudio();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    audio
      .play()
      .then(() => {
        setStatus("live");
        setIsPlaying(true);
      })
      .catch(() => {
        setStatus("offline");
        setIsPlaying(false);
        setErrorMessage(
          "El navegador bloqueó la reproducción. Pulsa de nuevo para escuchar la señal en vivo.",
        );
      });
  }, [ensureAudio, isPlaying]);

  const setVolume = useCallback(
    (value: number) => {
      const clamped = Math.min(1, Math.max(0, value));
      setVolumeState(clamped);
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const retry = useCallback(() => {
    const audio = ensureAudio();
    setStatus("loading");
    setErrorMessage(null);
    audio.load();
    audio
      .play()
      .then(() => {
        setStatus("live");
        setIsPlaying(true);
      })
      .catch(() => {
        setStatus("offline");
        setIsPlaying(false);
        setErrorMessage(
          "La señal sigue sin responder. Vuelve a intentarlo en unos momentos.",
        );
      });
  }, [ensureAudio]);

  return {
    status,
    isPlaying,
    volume,
    isMuted,
    errorMessage,
    togglePlay,
    setVolume,
    toggleMute,
    retry,
  };
}

export { VOLUME_STEP };
