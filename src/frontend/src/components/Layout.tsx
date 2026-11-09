import { createActor } from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import { LivePlayer } from "@/components/LivePlayer";
import { cn } from "@/lib/utils";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Inicio" },
  { to: "/noticias", label: "Noticias" },
  { to: "/programacion", label: "Programación" },
  { to: "/emisora", label: "La Emisora" },
];

function useIsAdmin(): boolean {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();
  const authenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data } = useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && authenticated,
  });
  return data === true;
}

function NavLink({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      data-ocid={`nav.link.${label.toLowerCase().replace(/\s+/g, "_")}`}
      className={cn(
        "rounded-full px-3 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = useIsAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            data-ocid="nav.brand_link"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-subtle">
              99
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                Radio Crepuscular
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                99.5 FM · Barquisimeto
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} label={item.label} />
            ))}
            {isAdmin && <NavLink to="/admin/noticias" label="Administración" />}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <SignInButton className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            data-ocid="nav.menu_toggle"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav
            aria-label="Navegación móvil"
            data-ocid="nav.mobile_menu"
            className="border-t border-border bg-card md:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin/noticias"
                  label="Administración"
                  onClick={() => setMenuOpen(false)}
                />
              )}
              <div className="pt-2">
                <SignInButton className="w-full rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted" />
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/40">
        <div className="container grid gap-8 py-12 md:grid-cols-3">
          <div className="space-y-3">
            <p className="font-display text-lg font-bold text-foreground">
              Radio Crepuscular
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Emisora comunitaria con sede en Barquisimeto, estado Lara,
              Venezuela. Transmitimos el latido del crepúsculo las 24 horas.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Contacto
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>+58 251 123 4567</li>
              <li>contacto@radiocrepuscular.com</li>
              <li>
                Calle 25 entre Carreras 18 y 19, Edif. Crepuscular, Piso 2
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Síguenos
            </p>
            <a
              href="https://www.tiktok.com/@RadioCrepuscularFM"
              target="_blank"
              rel="noreferrer"
              data-ocid="footer.tiktok_link"
              className="inline-flex text-sm text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline"
            >
              @RadioCrepuscularFM
            </a>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container py-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <LivePlayer />
    </div>
  );
}
