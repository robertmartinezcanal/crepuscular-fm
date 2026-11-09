import type { NewsError, NewsItem } from "@/backend";
import { RequireSignIn, SignInButton } from "@/components/InternetIdentity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateNews,
  useDeleteNews,
  useNewsList,
  useUpdateNews,
} from "@/hooks/use-news";
import { formatNewsDate } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

/** Human-readable message for a backend NewsError variant. */
function newsErrorMessage(error: NewsError): string {
  switch (error.__kind__) {
    case "notAuthor":
      return "No puedes modificar esta noticia porque pertenece a otro miembro del personal.";
    case "notFound":
      return "La noticia ya no existe. Actualiza la lista e inténtalo de nuevo.";
    default:
      return "No se pudo completar la operación. Inténtalo de nuevo.";
  }
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "__kind__" in error) {
    return newsErrorMessage(error as NewsError);
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

function NewsComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const createNews = useCreateNews();

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || createNews.isPending) return;
    const draft = { title: title.trim(), body: body.trim() };
    setTitle("");
    setBody("");
    createNews.mutate(draft, {
      onSuccess: () => toast.success("Noticia publicada."),
      onError: (error) => {
        setTitle((current) => (current === "" ? draft.title : current));
        setBody((current) => (current === "" ? draft.body : current));
        toast.error(errorMessage(error));
      },
    });
  }

  return (
    <Card
      className="rounded-lg border-border bg-card shadow-subtle"
      data-ocid="admin_news.composer"
    >
      <CardHeader>
        <CardTitle className="font-display text-xl">
          Publicar una noticia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="news-title">Título</Label>
            <Input
              id="news-title"
              data-ocid="admin_news.title_input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titular de la noticia o comunicado"
              maxLength={140}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-body">Contenido</Label>
            <Textarea
              id="news-body"
              data-ocid="admin_news.body_input"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Escribe aquí el comunicado completo para la audiencia."
              rows={5}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            {createNews.isError && (
              <p
                role="alert"
                data-ocid="admin_news.create_error_state"
                className="mr-auto text-sm text-destructive"
              >
                {errorMessage(createNews.error)}
              </p>
            )}
            <Button
              type="submit"
              data-ocid="admin_news.submit_button"
              disabled={!canSubmit || createNews.isPending}
              className="rounded-full bg-gradient-primary text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated"
            >
              <Plus className="size-4" />
              {createNews.isPending ? "Publicando…" : "Publicar noticia"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NewsRow({
  item,
  index,
  onEdit,
  onDelete,
}: {
  item: NewsItem;
  index: number;
  onEdit: (item: NewsItem) => void;
  onDelete: (item: NewsItem) => void;
}) {
  return (
    <li
      data-ocid={`admin_news.item.${index}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-subtle transition-smooth hover:border-primary/40 hover:shadow-elevated sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-success/15 font-mono text-[11px] uppercase tracking-widest text-success"
          >
            Publicado
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {formatNewsDate(item.publishedAt)}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.body}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid={`admin_news.edit_button.${index}`}
          onClick={() => onEdit(item)}
          className="rounded-full"
        >
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          data-ocid={`admin_news.delete_button.${index}`}
          onClick={() => onDelete(item)}
          className="rounded-full"
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </div>
    </li>
  );
}

function EditNewsDialog({
  item,
  onClose,
}: {
  item: NewsItem | null;
  onClose: () => void;
}) {
  const updateNews = useUpdateNews();
  const [title, setTitle] = useState(item?.title ?? "");
  const [body, setBody] = useState(item?.body ?? "");

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || !canSubmit || updateNews.isPending) return;
    updateNews.mutate(
      { id: item.id, title: title.trim(), body: body.trim() },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            toast.error(newsErrorMessage(result.err));
            return;
          }
          toast.success("Noticia actualizada.");
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  }

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-ocid="admin_news.edit_dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Editar noticia</DialogTitle>
          <DialogDescription>
            Actualiza el título y el contenido de tu publicación.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              data-ocid="admin_news.edit_title_input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={140}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-body">Contenido</Label>
            <Textarea
              id="edit-body"
              data-ocid="admin_news.edit_body_input"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
            />
          </div>
          {updateNews.isError && (
            <p
              role="alert"
              data-ocid="admin_news.edit_error_state"
              className="text-sm text-destructive"
            >
              {errorMessage(updateNews.error)}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin_news.cancel_button"
              onClick={onClose}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="admin_news.save_button"
              disabled={!canSubmit || updateNews.isPending}
              className="rounded-full bg-gradient-primary text-primary-foreground"
            >
              {updateNews.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteNewsDialog({
  item,
  onClose,
}: {
  item: NewsItem | null;
  onClose: () => void;
}) {
  const deleteNews = useDeleteNews();

  function handleConfirm() {
    if (!item || deleteNews.isPending) return;
    deleteNews.mutate(item.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          toast.error(newsErrorMessage(result.err));
          return;
        }
        toast.success("Noticia eliminada.");
        onClose();
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-ocid="admin_news.delete_dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Eliminar noticia</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. ¿Deseas eliminar «{item?.title}»?
          </DialogDescription>
        </DialogHeader>
        {deleteNews.isError && (
          <p
            role="alert"
            data-ocid="admin_news.delete_error_state"
            className="text-sm text-destructive"
          >
            {errorMessage(deleteNews.error)}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="admin_news.cancel_button"
            onClick={onClose}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            data-ocid="admin_news.confirm_button"
            disabled={deleteNews.isPending}
            onClick={handleConfirm}
            className="rounded-full"
          >
            {deleteNews.isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminNewsWorkspace() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toText();
  const { data: news, isLoading, isError, refetch } = useNewsList();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState<NewsItem | null>(null);

  const ownNews = (news ?? []).filter(
    (item) => item.author.toText() === principal,
  );

  return (
    <div className="container py-16 md:py-24" data-ocid="admin_news.page">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          Panel del personal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Administración de Noticias
        </h1>
        <p className="mt-3 text-muted-foreground">
          Publica, edita y elimina las noticias y comunicados de Radio
          Crepuscular. Solo verás y podrás modificar tus propias publicaciones.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <NewsComposer />

        <section aria-label="Mis noticias" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Mis publicaciones
            </h2>
            {ownNews.length > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                {ownNews.length} {ownNews.length === 1 ? "noticia" : "noticias"}
              </span>
            )}
          </div>

          {isLoading && (
            <ul className="space-y-3" data-ocid="admin_news.loading_state">
              {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map(
                (id) => (
                  <li key={id}>
                    <Skeleton className="h-28 w-full rounded-lg" />
                  </li>
                ),
              )}
            </ul>
          )}

          {isError && (
            <div
              data-ocid="admin_news.error_state"
              className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center"
            >
              <p className="text-sm text-foreground">
                No se pudieron cargar tus noticias.
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="admin_news.retry_button"
                onClick={() => void refetch()}
                className="mt-4 rounded-full"
              >
                Reintentar
              </Button>
            </div>
          )}

          {!isLoading && !isError && ownNews.length === 0 && (
            <div
              data-ocid="admin_news.empty_state"
              className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center"
            >
              <p className="font-display text-lg font-semibold text-foreground">
                Aún no has publicado noticias
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Usa el formulario para compartir tu primer comunicado con la
                audiencia.
              </p>
            </div>
          )}

          {!isLoading && !isError && ownNews.length > 0 && (
            <ul className="space-y-3" data-ocid="admin_news.list">
              {ownNews.map((item, index) => (
                <NewsRow
                  key={item.id.toString()}
                  item={item}
                  index={index + 1}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <EditNewsDialog
        key={editing?.id.toString() ?? "none"}
        item={editing}
        onClose={() => setEditing(null)}
      />
      <DeleteNewsDialog
        key={deleting?.id.toString() ?? "none"}
        item={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export default function AdminNewsPage() {
  return (
    <RequireSignIn
      fallback={
        <div
          className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
          data-ocid="admin_news.signin_prompt"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            Acceso restringido
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Inicia sesión para administrar las noticias
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Solo el personal de la emisora puede publicar, editar y eliminar
            noticias. Inicia sesión con tu Internet Identity para continuar.
          </p>
          <SignInButton className="mt-6 rounded-full bg-gradient-primary px-6 py-3 font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      }
    >
      <AdminNewsWorkspace />
    </RequireSignIn>
  );
}
