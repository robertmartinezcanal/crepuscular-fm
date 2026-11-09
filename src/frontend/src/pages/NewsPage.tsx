import { useNewsList } from "@/hooks/use-news";
import { formatNewsDate, timestampToDate } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";

const PREVIEW_LENGTH = 180;

function buildPreview(body: string): string {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= PREVIEW_LENGTH) return clean;
  return `${clean.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
}

function NewsSkeleton() {
  return (
    <div className="space-y-4" data-ocid="news.loading_state">
      {Array.from({ length: 4 }, (_, i) => `news-skeleton-${i}`).map((id) => (
        <div
          key={id}
          className="rounded-lg border border-border bg-card p-6 shadow-subtle"
        >
          <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const { data, isLoading, isError, refetch } = useNewsList();

  const items = [...(data ?? [])].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );

  return (
    <div className="container py-16 md:py-24" data-ocid="news.page">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          Sala de redacción
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Noticias y Comunicados
        </h1>
        <p className="mt-3 text-muted-foreground">
          Las últimas noticias y comunicados de Radio Crepuscular, ordenados del
          más reciente al más antiguo.
        </p>
      </header>

      <div className="mt-10">
        {isLoading && <NewsSkeleton />}

        {isError && (
          <div
            className="rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center"
            data-ocid="news.error_state"
          >
            <p className="font-display text-lg font-semibold text-foreground">
              No pudimos cargar las noticias
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Revisa tu conexión e inténtalo de nuevo.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              data-ocid="news.retry_button"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div
            className="rounded-lg border border-dashed border-border bg-card p-12 text-center"
            data-ocid="news.empty_state"
          >
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Newspaper className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-5 font-display text-lg font-semibold text-foreground">
              Aún no hay noticias publicadas
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Cuando la emisora publique su primer comunicado, aparecerá aquí.
              Mientras tanto, puedes sintonizar la señal en vivo.
            </p>
            <Link
              to="/"
              data-ocid="news.empty_home_link"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <ul className="space-y-4" data-ocid="news.list">
            {items.map((item, index) => (
              <li key={item.id.toString()}>
                <Link
                  to="/noticias/$id"
                  params={{ id: item.id.toString() }}
                  data-ocid={`news.item.${index + 1}`}
                  className="group block rounded-lg border border-border bg-card p-6 shadow-subtle transition-smooth hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <time
                    dateTime={
                      timestampToDate(item.publishedAt)?.toISOString() ??
                      undefined
                    }
                    className="font-mono text-xs font-semibold uppercase tracking-widest text-primary"
                  >
                    {formatNewsDate(item.publishedAt)}
                  </time>
                  <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground group-hover:text-primary md:text-2xl">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {buildPreview(item.body)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Leer más
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
