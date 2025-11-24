import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BeatCard, type BeatCardData } from "@/components/BeatCard";

const placeholderBeats: BeatCardData[] = [
  {
    id: "demo-1",
    title: "LATAM Trap",
    slug: "latam-trap",
    description: "Drums agresivos + 808 oscuro ideal para artistas de trap",
    genre: "Trap",
    coverUrl: null,
    previewUrl: null,
    licenses: [
      { id: "lic-1", priceCents: 20000, currency: "ARS" },
      { id: "lic-2", priceCents: 48000, currency: "ARS" },
    ],
    producer: {
      name: "Demo Producer",
      slug: "demo",
    },
  },
  {
    id: "demo-2",
    title: "Reggaetón Playa",
    slug: "reggaeton-playa",
    description: "Melodías cálidas con dembow listo para vocales comerciales",
    genre: "Reggaetón",
    coverUrl: null,
    previewUrl: null,
    licenses: [
      { id: "lic-3", priceCents: 25000, currency: "ARS" },
      { id: "lic-4", priceCents: 52000, currency: "ARS" },
    ],
    producer: {
      name: "Demo Producer",
      slug: "demo",
    },
  },
];

async function getLandingData() {
  type BeatLicenseEntity = Awaited<
    ReturnType<typeof prisma.beatLicense.findMany>
  >[number];

  type LandingBeat = Awaited<
    ReturnType<typeof prisma.beat.findMany>
  >[number] & {
    licenses: BeatLicenseEntity[];
    producer: {
      name: string;
      slug: string;
    };
  };

  const [beats, stats, beatsCount] = await Promise.all([
    prisma.beat.findMany({
      where: { isPublished: true },
      include: {
        licenses: true,
        producer: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }) as Promise<LandingBeat[]>,
    prisma.user.aggregate({
      where: { role: "PRODUCER" },
      _count: { _all: true },
    }),
    prisma.beat.count(),
  ]);

  const producersCount = stats._count._all;
  const normalizedBeats: BeatCardData[] = beats.map((beat: LandingBeat) => ({
    id: beat.id,
    title: beat.title,
    slug: beat.slug,
    description: beat.description,
    genre: beat.genre,
    coverUrl: beat.coverUrl,
    previewUrl: beat.previewUrl,
    licenses: beat.licenses.map((license: LandingBeat["licenses"][number]) => ({
      id: license.id,
      priceCents: license.priceCents,
      currency: license.currency,
    })),
    producer: beat.producer,
  }));

  return { beats: normalizedBeats, producersCount, beatsCount };
}

export default async function Home() {
  const { beats, producersCount, beatsCount } = await getLandingData();
  const cards: BeatCardData[] = beats.length ? beats : placeholderBeats;
  const benefits = [
    {
      title: "Landing personal",
      description:
        "URL propia con tu catálogo, branding y links a redes para cerrar tratos más rápido.",
      icon: Sparkles,
    },
    {
      title: "Checkout local",
      description:
        "Cobrá en tu moneda con Mercado Pago Checkout Pro, sin mandar links manuales.",
      icon: Wallet,
    },
    {
      title: "Control total",
      description:
        "Define licencias, precios y formatos por beat. Ajusta términos según el cliente.",
      icon: ShieldCheck,
    },
  ];

  const workflow = [
    {
      label: "Beatmakers",
      steps: [
        "Crea tu cuenta y sube tu preview",
        "Define licencias y activa tu landing",
        "Comparte el checkout para cerrar la venta",
      ],
    },
    {
      label: "Artistas & managers",
      steps: [
        "Explora catálogos por género o productor",
        "Escucha previews sin cortar tu navegación",
        "Compra licencias en minutos con MP",
      ],
    },
  ];

  return (
    <div className="space-y-16 pb-32">
      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-white/60">
          <span className="rounded-full border border-pink-300 dark:border-white/20 px-3 py-1 uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">
            Beats al vuelo
          </span>
          <span>Publicá, compartí y vendé tu catálogo en todo LATAM</span>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr,0.7fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl text-gray-900 dark:text-white">
              Publicá tus beats hoy mismo y deja que tus clientes compren cómo
              quieran.
            </h1>
            <p className="text-lg text-gray-600 dark:text-white/70">
              Subí tus previews, configurá licencias y compartí un checkout
              local desde una sola plataforma. Todo pensado para que tu próxima
              venta salga en minutos, no semanas.
            </p>
            <ul className="grid gap-3 text-sm text-gray-600 dark:text-white/70 sm:grid-cols-2">
              <li className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3">
                • Subí MP3/WAV y define precios en segundos.
              </li>
              <li className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3">
                • Landing automática con player y stats para compartir.
              </li>
              <li className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3">
                • Checkout integrado con datos del comprador y validaciones.
              </li>
              <li className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3">
                • Licencias flexibles para cada beat (MP3, WAV, stems).
              </li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-linear-to-r from-pink-500 to-orange-500 px-6 py-3 font-semibold"
              >
                Empezar gratis
              </Link>
              <Link
                href="/beats"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-white/20 px-6 py-3 font-semibold text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-transparent"
              >
                Escuchar catálogo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {benefits.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none"
          >
            <Icon className="text-pink-600 dark:text-pink-400" size={24} />
            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70">
              {description}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">
              Destacados
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Beats listos para grabar
            </h2>
          </div>
          <Link
            href="/producers"
            className="text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((beat: BeatCardData) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </section>

      <section
        id="workflow"
        className="space-y-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 shadow-sm dark:shadow-none"
      >
        <div className="flex flex-wrap gap-6">
          {workflow.map((group) => (
            <div key={group.label} className="flex-1 min-w-[260px] space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">
                {group.label}
              </p>
              <ol className="space-y-3 text-sm text-gray-700 dark:text-white/80">
                {group.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3"
                  >
                    <span className="text-pink-600 dark:text-pink-300 font-semibold">
                      0{index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black/30 dark:to-black/20 p-8 shadow-sm dark:shadow-none">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">
              Licencias a medida
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              Decidís los términos, alcances y el precio por cada beat.
            </h3>
            <p className="mt-4 text-gray-600 dark:text-white/70">
              No ofrecemos planes prearmados porque cada productor negocia con
              reglas distintas. Ajustá streams permitidos, monetización, uso de
              shows en vivo y entrega de stems según cada lanzamiento.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-gray-700 dark:text-white/80">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3">
                • Crea combinaciones como "MP3 promo", "WAV comercial" o "Stems
                exclusivos" con los nombres que prefieras.
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3">
                • Define monedas y límites (streams, territorios, sync, etc.) y
                edítalos cuando cambie tu estrategia.
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3">
                • Incluye notas personalizadas para aclarar créditos, splits o
                upgrades privados.
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 text-gray-700 dark:text-white/80 shadow-sm dark:shadow-none">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">
              Transparencia para el artista
            </p>
            <p className="mt-2 text-lg text-gray-900 dark:text-white">
              Cada vez que alguien abre tu landing ve exactamente las
              condiciones que configuraste, con comparativas claras y CTA para
              pagar. No hay cuadros genéricos ni sorpresas.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-white/70">
              <li>• Tabla dinámica renderizada con tu copy y tus límites.</li>
              <li>
                • Contrato automático usando tus cláusulas al confirmar el pago.
              </li>
              <li>
                • Posibilidad de desactivar licencias o poner "a consultar"
                cuando quieras.
              </li>
            </ul>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200"
            >
              Configurar mis licencias <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-white/5 dark:to-transparent p-10 text-center shadow-lg dark:shadow-none">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">
          Listo para despegar
        </p>
        <h3 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
          Enfocate en producir. Nosotros nos encargamos del marketing y los
          cobros.
        </h3>
        <p className="mt-4 text-gray-600 dark:text-white/70">
          Suma tus beats, crea tu landing y empieza a vender licencias hoy
          mismo. Sin comisiones ocultas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-linear-to-r from-pink-500 to-orange-500 px-8 py-3 font-semibold"
          >
            Publicar mis beats
          </Link>
          <Link
            href="/producers"
            className="rounded-full border border-gray-300 dark:border-white/20 px-8 py-3 font-semibold text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-transparent"
          >
            Ver productores activos
          </Link>
        </div>
      </section>
    </div>
  );
}
