import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsItem } from "@/hooks/use-news";
import { formatNewsDate } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Newspaper } from "lucide-react";

function parseNewsId(raw: string): bigint | undefined {
  if (!/^\d+$/.test(raw)) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function BackToNewsLink() {
  return (
    <Link
      to="/noticias"
      data-ocid="news_detail.back_link"
      className="inline-flex items-center gap-2 rounded-full text-sm font-medium text-muted-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Volver a noticias
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div
      className="container max-w-3xl py-16 md:py-24"
      data-ocid="news_detail.loading_state"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-5 w-40 rounded-full" />
      <Skeleton className="mt-8 h-10 w-full rounded-lg" />
      <Skeleton className="mt-3 h-10 w-3/4 rounded-lg" />
      <Skeleton className="mt-6 h-5 w-52 rounded-full" />
      <div className="mt-10 space-y-4">
        {Array.from({ length: 6 }, (_, i) => `news-detail-line-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-4 w-full rounded" />
          ),
        )}
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div
      className="container max-w-2xl py-20 text-center md:py-28"
      data-ocid="news_detail.not_found_state"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Newspaper className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Noticia no encontrada
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        La noticia o comunicado que buscas no existe o ya no está disponible.
        Puedes revisar las publicaciones más recientes.
      </p>
      <div className="mt-8 flex justify-center">
        <Button
          asChild
          className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
        >
          <Link to="/noticias" data-ocid="news_detail.not_found_back_button">
            Ver todas las noticias
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div
      className="container max-w-2xl py-20 text-center md:py-28"
      data-ocid="news_detail.error_state"
    >
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        No pudimos cargar la noticia
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Ocurrió un problema al recuperar esta publicación. Intenta de nuevo en
        unos momentos.
      </p>
      <div className="mt-8 flex justify-center">
        <Button
          asChild
          variant="outline"
          className="rounded-full transition-smooth"
        >
          <Link to="/noticias" data-ocid="news_detail.error_back_button">
            Volver a noticias
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function NewsDetailPage() {
  const { id: rawId } = useParams({ from: "/noticias/$id" });
  const newsId = parseNewsId(rawId);
  const { data, isLoading, isError } = useNewsItem(newsId);

  if (newsId === undefined) {
    return <NotFoundState />;
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError) {
    return <ErrorState />;
  }

  if (!data) {
    return <NotFoundState />;
  }

  const paragraphs = data.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block, index) => ({ id: `news-detail-paragraph-${index}`, block }));

  return (
    <article
      className="container max-w-3xl py-16 md:py-24"
      data-ocid="news_detail.page"
    >
      <BackToNewsLink />

      <header className="mt-8 animate-fade-in">
        <Badge
          variant="secondary"
          className="rounded-full font-mono text-[11px] uppercase tracking-widest"
        >
          Noticia
        </Badge>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {data.title}
        </h1>
        <p className="mt-5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden="true" />
          <time
            dateTime={new Date(
              Number(data.publishedAt / 1_000_000n),
            ).toISOString()}
          >
            {formatNewsDate(data.publishedAt)}
          </time>
        </p>
      </header>

      <div className="mt-8 h-px w-full bg-border" />

      <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90 md:text-lg">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.id}>{paragraph.block}</p>
        ))}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <BackToNewsLink />
      </div>
    </article>
  );
}
