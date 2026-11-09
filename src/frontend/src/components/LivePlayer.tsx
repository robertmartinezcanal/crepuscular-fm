import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLiveStream } from "@/hooks/use-live-stream";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useReducedMotion } from "motion/react";

const EQUALIZER_BARS = [0, 1, 2, 3, 4];

function Equalizer({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  return (
    <div
      aria-hidden="true"
      className="flex h-6 items-end gap-[3px]"
      data-ocid="player.equalizer"
    >
      {EQUALIZER_BARS.map((bar) => (
        <span
          key={`eq-${bar}`}
          className={cn(
            "w-[3px] origin-bottom rounded-full bg-primary",
            animate ? "animate-equalizer" : "h-2 opacity-40",
          )}
          style={
            animate
              ? { height: "100%", animationDelay: `${bar * 0.12}s` }
              : undefined
          }
        />
      ))}
    </div>
  );
}

function StatusChip({ status }: { status: "loading" | "live" | "offline" }) {
  const reduceMotion = useReducedMotion();
  if (status === "live") {
    return (
      <span
        data-ocid="player.status.live"
        className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-success"
      >
        <span
          className={cn(
            "size-2 rounded-full bg-success",
            !reduceMotion && "animate-signal-pulse",
          )}
        />
        En vivo
      </span>
    );
  }
  if (status === "loading") {
    return (
      <span
        data-ocid="player.status.loading"
        className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        <Loader2 className={cn("size-3", !reduceMotion && "animate-spin")} />
        Conectando
      </span>
    );
  }
  return (
    <span
      data-ocid="player.status.offline"
      className="inline-flex items-center gap-2 rounded-full bg-destructive/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-destructive"
    >
      <span className="size-2 rounded-full bg-destructive" />
      Sin señal
    </span>
  );
}

export function LivePlayer() {
  const reduceMotion = useReducedMotion();
  const {
    status,
    isPlaying,
    volume,
    isMuted,
    errorMessage,
    togglePlay,
    setVolume,
    toggleMute,
    retry,
  } = useLiveStream();

  const playLabel = isPlaying
    ? "Pausar la señal en vivo"
    : "Reproducir la señal en vivo";

  return (
    <section
      aria-label="Reproductor en vivo"
      data-ocid="player.panel"
      className="sticky bottom-0 z-40 border-t border-border bg-card/95 shadow-elevated backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="container flex flex-wrap items-center gap-x-4 gap-y-3 py-3 md:py-4">
        <Button
          type="button"
          size="icon"
          aria-label={playLabel}
          data-ocid="player.play_button"
          onClick={togglePlay}
          className="size-12 shrink-0 rounded-full bg-gradient-primary text-primary-foreground shadow-elevated transition-smooth hover:scale-105 hover:shadow-elevated focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {status === "loading" && !isPlaying ? (
            <Loader2
              className={cn("size-5", !reduceMotion && "animate-spin")}
            />
          ) : isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5 translate-x-[1px]" />
          )}
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Equalizer active={isPlaying} />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              Radio Crepuscular
            </p>
            <p className="truncate font-mono text-xs uppercase tracking-widest text-muted-foreground">
              99.5 FM · Barquisimeto
            </p>
          </div>
        </div>

        <StatusChip status={status} />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            data-ocid="player.mute_button"
            onClick={toggleMute}
            className="size-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </Button>
          <Slider
            aria-label="Volumen"
            data-ocid="player.volume_input"
            value={[isMuted ? 0 : Math.round(volume * 100)]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => setVolume((values[0] ?? 0) / 100)}
            className="w-24 md:w-32"
          />
        </div>
      </div>

      {status === "offline" && errorMessage && (
        <div
          data-ocid="player.error_state"
          className="border-t border-border bg-destructive/10"
        >
          <div className="container flex flex-wrap items-center justify-between gap-3 py-2">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-ocid="player.retry_button"
              onClick={retry}
              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="size-3.5" />
              Reintentar
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
