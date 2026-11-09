import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchedule } from "@/hooks/use-schedule";
import {
  type ProgramSlot,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type Weekday,
  findCurrentProgram,
  timeToMinutes,
  weekdayFromDate,
} from "@/types";
import { CalendarClock, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatTime(time: string): string {
  const minutes = timeToMinutes(time);
  if (minutes === null) return time;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function sortSlots(slots: ProgramSlot[]): ProgramSlot[] {
  return [...slots].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime) ?? Number.MAX_SAFE_INTEGER;
    const bStart = timeToMinutes(b.startTime) ?? Number.MAX_SAFE_INTEGER;
    return aStart - bStart;
  });
}

function ProgramCard({
  slot,
  isLive,
  index,
}: {
  slot: ProgramSlot;
  isLive: boolean;
  index: number;
}) {
  return (
    <article
      data-ocid={`schedule.item.${index}`}
      className={
        isLive
          ? "relative flex flex-col gap-3 rounded-lg border border-primary/50 bg-card p-4 shadow-elevated transition-smooth"
          : "relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
      }
    >
      {isLive && (
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-primary"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-muted-foreground">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </span>
        {isLive && (
          <Badge
            data-ocid={`schedule.live_badge.${index}`}
            className="gap-1.5 rounded-full border-transparent bg-success/15 font-mono text-xs font-semibold uppercase tracking-widest text-success"
          >
            <span
              aria-hidden="true"
              className="size-1.5 animate-signal-pulse rounded-full bg-success"
            />
            Al aire
          </Badge>
        )}
      </div>
      <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">
        {slot.name}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {slot.description}
      </p>
    </article>
  );
}

function DayColumn({
  weekday,
  slots,
  isToday,
  liveSlot,
}: {
  weekday: Weekday;
  slots: ProgramSlot[];
  isToday: boolean;
  liveSlot: ProgramSlot | null;
}) {
  return (
    <section
      data-ocid={`schedule.day.${weekday}`}
      aria-label={WEEKDAY_LABELS[weekday]}
      className={
        isToday
          ? "flex flex-col gap-4 rounded-lg border border-primary/40 bg-muted/30 p-4 md:p-5"
          : "flex flex-col gap-4 rounded-lg border border-border bg-muted/10 p-4 md:p-5"
      }
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          {WEEKDAY_LABELS[weekday]}
        </h2>
        {isToday && (
          <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
            Hoy
          </span>
        )}
      </header>

      {slots.length === 0 ? (
        <div
          data-ocid={`schedule.empty_state.${weekday}`}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-4 py-8 text-center"
        >
          <Radio className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            Sin programación
          </p>
          <p className="text-xs text-muted-foreground">
            Aún no hay programas cargados para este día.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {slots.map((slot, index) => (
            <ProgramCard
              key={`${slot.weekday}-${slot.startTime}-${slot.name}`}
              slot={slot}
              isLive={liveSlot === slot}
              index={index + 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ScheduleSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `schedule-skeleton-${i}`);
  return (
    <div
      data-ocid="schedule.loading_state"
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {ids.map((id) => (
        <div
          key={id}
          className="flex flex-col gap-4 rounded-lg border border-border bg-muted/10 p-5"
        >
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function SchedulePage() {
  const { data, isLoading, isError, refetch } = useSchedule();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const slots = useMemo(() => data ?? [], [data]);
  const today = weekdayFromDate(now);
  const liveSlot = useMemo(() => findCurrentProgram(slots, now), [slots, now]);

  const byDay = useMemo(() => {
    const grouped = new Map<Weekday, ProgramSlot[]>();
    for (const weekday of WEEKDAY_ORDER) grouped.set(weekday, []);
    for (const slot of slots) {
      const bucket = grouped.get(slot.weekday);
      if (bucket) bucket.push(slot);
    }
    for (const [weekday, list] of grouped)
      grouped.set(weekday, sortSlots(list));
    return grouped;
  }, [slots]);

  return (
    <div className="container py-16 md:py-24" data-ocid="schedule.page">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          99.5 FM · Parrilla semanal
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Programación Semanal
        </h1>
        <p className="mt-3 text-muted-foreground">
          Consulta los programas que acompañan cada día en Radio Crepuscular. El
          programa que suena ahora mismo se marca con la señal al aire.
        </p>
      </header>

      {liveSlot && (
        <div
          data-ocid="schedule.now_playing"
          className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-card p-4 shadow-subtle md:p-5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
            <Radio className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-success">
              Al aire ahora
            </p>
            <p className="truncate font-display text-lg font-bold tracking-tight text-foreground">
              {liveSlot.name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {formatTime(liveSlot.startTime)} – {formatTime(liveSlot.endTime)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-10">
        {isLoading ? (
          <ScheduleSkeleton />
        ) : isError ? (
          <div
            data-ocid="schedule.error_state"
            className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-card px-6 py-12 text-center"
          >
            <p className="font-display text-lg font-bold text-foreground">
              No pudimos cargar la programación
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Ocurrió un problema al consultar la parrilla. Intenta de nuevo.
            </p>
            <button
              type="button"
              data-ocid="schedule.retry_button"
              onClick={() => void refetch()}
              className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reintentar
            </button>
          </div>
        ) : slots.length === 0 ? (
          <div
            data-ocid="schedule.empty_state"
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CalendarClock className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-bold text-foreground">
              La parrilla está vacía
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Todavía no hay programas publicados. Vuelve pronto para descubrir
              la programación de Radio Crepuscular.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {WEEKDAY_ORDER.map((weekday) => (
              <DayColumn
                key={weekday}
                weekday={weekday}
                slots={byDay.get(weekday) ?? []}
                isToday={weekday === today}
                liveSlot={liveSlot}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
