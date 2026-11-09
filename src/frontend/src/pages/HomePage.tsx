import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsList } from "@/hooks/use-news";
import { useSchedule } from "@/hooks/use-schedule";
import {
  type NewsItem,
  WEEKDAY_LABELS,
  findCurrentProgram,
  formatNewsDate,
} from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Newspaper, Radio } from "lucide-react";
import { useMemo } from "react";

const PREVIEW_COUNT = 3;

function NewsPreviewCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <Card
      data-ocid={`home.news.item.${index + 1}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-none transition-smooth hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
        <time>{formatNewsDate(item.publishedAt)}</time>
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
        {item.title}
      </h3>
      <p className="line-clamp-3 text-sm text-muted-foreground">{item.body}</p>
      <Link
        to="/noticias/$id"
        params={{ id: item.id.toString() }}
        data-ocid={`home.news.link.${index + 1}`}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        Leer noticia
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  );
}

function NewsPreviewSkeleton({ id }: { id: string }) {
  return (
    <Card
      key={id}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-none"
    >
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </Card>
  );
}

export default function HomePage() {
  const { data: news, isLoading, isError } = useNewsList();
  const { data: schedule } = useSchedule();

  const recentNews = useMemo(() => {
    if (!news) return [];
    return [...news]
      .sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1))
      .slice(0, PREVIEW_COUNT);
  }, [news]);

  const currentProgram = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;
    return findCurrentProgram(schedule, new Date());
  }, [schedule]);

  const skeletonIds = Array.from(
    { length: PREVIEW_COUNT },
    (_, i) => `home-news-skeleton-${i}`,
  );

  return (
    <div data-ocid="home.page">
      {/* Hero — station identity */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src="/assets/generated/hero-crepusculo.dim_1600x900.jpg"
          alt="Cielo del crepúsculo sobre los tejados de Barquisimeto, con tonos ámbar y carbón"
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="container relative py-20 md:py-32">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            99.5 FM · Al aire desde Barquisimeto
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Sintoniza el Latido del Crepúsculo
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Radio Crepuscular transmite la voz de la comunidad larense. Pulsa
            reproducir en el reproductor para escuchar la señal en vivo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              data-ocid="home.listen_button"
              className="rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-elevated transition-smooth hover:scale-[1.02]"
            >
              <Link to="/programacion">
                <Radio className="size-4" />
                Ver programación
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              data-ocid="home.news_button"
              className="rounded-full border-border px-6"
            >
              <Link to="/noticias">
                <Newspaper className="size-4" />
                Todas las noticias
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Now on air */}
      <section
        aria-label="Al aire ahora"
        data-ocid="home.now_playing.section"
        className="border-b border-border bg-muted/30"
      >
        <div className="container flex flex-wrap items-center gap-x-4 gap-y-2 py-5">
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="size-2 animate-signal-pulse rounded-full bg-primary" />
            Al aire ahora
          </span>
          {currentProgram ? (
            <p className="text-sm text-foreground">
              <span className="font-display font-semibold">
                {currentProgram.name}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · {WEEKDAY_LABELS[currentProgram.weekday]}{" "}
                {currentProgram.startTime}–{currentProgram.endTime}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Consulta la programación para conocer los próximos espacios.
            </p>
          )}
        </div>
      </section>

      {/* Recent news preview */}
      <section
        aria-labelledby="home-news-heading"
        data-ocid="home.news.section"
        className="container py-16 md:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Actualidad
            </p>
            <h2
              id="home-news-heading"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              Últimas noticias
            </h2>
          </div>
          <Link
            to="/noticias"
            data-ocid="home.news.view_all_link"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Ver todas
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div
              data-ocid="home.news.loading_state"
              className="grid gap-5 md:grid-cols-3"
            >
              {skeletonIds.map((id) => (
                <NewsPreviewSkeleton key={id} id={id} />
              ))}
            </div>
          ) : isError ? (
            <div
              data-ocid="home.news.error_state"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive"
            >
              No pudimos cargar las noticias. Intenta recargar la página.
            </div>
          ) : recentNews.length === 0 ? (
            <div
              data-ocid="home.news.empty_state"
              className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Newspaper className="size-6" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Aún no hay noticias publicadas
                </h3>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Cuando la emisora publique sus primeros comunicados,
                  aparecerán aquí. Mientras tanto, puedes seguir la señal en
                  vivo.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                data-ocid="home.news.empty_action_button"
                className="rounded-full border-border px-6"
              >
                <Link to="/programacion">Ver la programación</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {recentNews.map((item, index) => (
                <NewsPreviewCard
                  key={item.id.toString()}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Station identity strip */}
      <section
        aria-label="Sobre la emisora"
        data-ocid="home.identity.section"
        className="border-t border-border bg-card"
      >
        <div className="container grid gap-8 py-14 md:grid-cols-3">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="rounded-full font-mono text-[11px] uppercase tracking-widest"
            >
              Comunitaria
            </Badge>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Voz de la comunidad
            </h3>
            <p className="text-sm text-muted-foreground">
              Una emisora hecha por y para los vecinos de Barquisimeto y el
              estado Lara.
            </p>
          </div>
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="rounded-full font-mono text-[11px] uppercase tracking-widest"
            >
              99.5 FM
            </Badge>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Señal abierta
            </h3>
            <p className="text-sm text-muted-foreground">
              Transmitimos las 24 horas desde el corazón de la ciudad, con
              música, cultura y servicio.
            </p>
          </div>
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="rounded-full font-mono text-[11px] uppercase tracking-widest"
            >
              Crepúsculo
            </Badge>
            <h3 className="font-display text-lg font-semibold text-foreground">
              El latido de la tarde
            </h3>
            <p className="text-sm text-muted-foreground">
              Programación pensada para acompañar cada momento del día larense.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
