import { Mail, MapPin, Phone, Radio, Signal } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const STATION = {
  name: "Radio Crepuscular",
  frequency: "99.5 FM",
  slogan: "El latido del crepúsculo",
  city: "Barquisimeto",
  state: "Estado Lara",
  country: "Venezuela",
  description:
    "Radio Crepuscular 99.5 FM es una emisora comunitaria que transmite desde Barquisimeto, estado Lara, Venezuela. Nacimos para dar voz a los vecinos: música, noticias locales, cultura larense y espacios de participación ciudadana. Nuestra señal acompaña el día y la noche de la comunidad, con una programación hecha por y para la gente.",
  phone: "+58 251 123 4567",
  phoneHref: "tel:+582511234567",
  email: "contacto@radiocrepuscular.com",
  address:
    "Calle 25 entre Carreras 18 y 19, Edif. Crepuscular, Piso 2, Barquisimeto, Estado Lara, Venezuela",
  tiktokHandle: "@RadioCrepuscularFM",
  tiktokUrl: "https://www.tiktok.com/@RadioCrepuscularFM",
};

const FACTS = [
  { label: "Frecuencia", value: STATION.frequency, icon: Signal },
  { label: "Ciudad", value: STATION.city, icon: MapPin },
  {
    label: "Región",
    value: `${STATION.state}, ${STATION.country}`,
    icon: Radio,
  },
];

export default function StationPage() {
  return (
    <div data-ocid="station.page">
      <section className="border-b border-border bg-gradient-subtle">
        <div className="container py-16 md:py-24">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            La Emisora
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {STATION.name}{" "}
            <span className="text-gradient-primary">{STATION.frequency}</span>
          </h1>
          <p className="mt-3 font-display text-lg text-muted-foreground md:text-xl">
            {STATION.slogan}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {STATION.description}
          </p>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {FACTS.map((fact) => (
              <div
                key={fact.label}
                data-ocid={`station.fact.${fact.label.toLowerCase()}`}
                className="rounded-lg border border-border bg-card p-5 shadow-subtle"
              >
                <dt className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <fact.icon
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  {fact.label}
                </dt>
                <dd className="mt-2 font-display text-lg font-semibold text-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Contacto
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Escríbenos, llámanos o visítanos. La emisora está abierta a la
          comunidad.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a
            href={STATION.phoneHref}
            data-ocid="station.phone_link"
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-subtle transition-smooth hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
              <Phone className="size-5" aria-hidden="true" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Teléfono
            </span>
            <span className="font-display text-lg font-semibold text-foreground">
              {STATION.phone}
            </span>
            <span className="text-sm text-muted-foreground">
              Toca para llamar
            </span>
          </a>

          <a
            href={`mailto:${STATION.email}`}
            data-ocid="station.email_link"
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-subtle transition-smooth hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
              <Mail className="size-5" aria-hidden="true" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Correo
            </span>
            <span className="break-all font-display text-lg font-semibold text-foreground">
              {STATION.email}
            </span>
            <span className="text-sm text-muted-foreground">
              Toca para escribir
            </span>
          </a>

          <div
            data-ocid="station.address_card"
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-subtle"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dirección
            </span>
            <span className="font-display text-base font-semibold leading-snug text-foreground">
              {STATION.address}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
              <SiTiktok className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Síguenos en TikTok
              </p>
              <p className="font-display text-lg font-semibold text-foreground">
                {STATION.tiktokHandle}
              </p>
            </div>
          </div>
          <a
            href={STATION.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            data-ocid="station.tiktok_link"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SiTiktok className="size-4" aria-hidden="true" />
            Ver perfil
          </a>
        </div>
      </section>
    </div>
  );
}
