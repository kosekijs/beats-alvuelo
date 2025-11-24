import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/CheckoutForm";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Check } from "lucide-react";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value / 100);

const licenseLabels: Record<string, string> = {
  BASIC: "Básica",
  PREMIUM: "Premium",
  EXCLUSIVE: "Exclusiva",
};

const deliveryLabels: Record<string, string> = {
  MP3_WAV: "MP3 + WAV",
  STEMS: "Stems completos",
};

const licenseBenefits: Record<string, string[]> = {
  BASIC: [
    "Uso personal y redes",
    "Hasta 10k streams",
    "Archivo MP3 listo para grabar",
  ],
  PREMIUM: [
    "Monetización en plataformas",
    "Archivos WAV + MP3",
    "Hasta 100k streams",
  ],
  EXCLUSIVE: [
    "Transferencia total",
    "Entrega de stems completos",
    "Streams ilimitados",
  ],
};

type BeatLicenseEntity = Awaited<
  ReturnType<typeof prisma.beatLicense.findMany>
>[number];

type BeatDetail = NonNullable<
  Awaited<ReturnType<typeof prisma.beat.findUnique>>
> & {
  licenses: BeatLicenseEntity[];
  producer: {
    name: string;
    slug: string;
    country: string | null;
    bio: string | null;
  };
};

export default async function BeatDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = (await prisma.beat.findUnique({
    where: { slug },
    include: {
      licenses: {
        orderBy: { priceCents: "asc" },
      },
      producer: {
        select: {
          name: true,
          slug: true,
          country: true,
          bio: true,
        },
      },
    },
  })) as BeatDetail | null;

  if (!beat || !beat.isPublished) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <Link href="/beats" className="text-sm text-white/60">
          ← Volver al catálogo
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
                {beat.genre || "Beat"}
              </p>
              <h1 className="text-4xl font-semibold">{beat.title}</h1>
              <p className="text-white/70">{beat.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
                <span>BPM: {beat.bpm || "N/D"}</span>
                <span>Tags: {beat.moodTags || "sin tags"}</span>
                <span>
                  Productor:{" "}
                  <Link
                    className="text-pink-300"
                    href={`/pro/${beat.producer.slug}`}
                  >
                    {beat.producer.name}
                  </Link>
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
              <p className="font-semibold text-white">Productor</p>
              <p>{beat.producer.name}</p>
              <p>{beat.producer.country || "Latinoamérica"}</p>
              {beat.producer.bio && (
                <p className="mt-2 text-white/60">{beat.producer.bio}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-white/60">Preview</p>
            <AudioPlayer
              trackId={beat.id}
              src={beat.previewUrl}
              title={beat.title}
              artwork={beat.coverUrl}
              producer={beat.producer.name}
              beatSlug={beat.slug}
              producerSlug={beat.producer.slug}
            />
          </div>
        </section>
        <aside className="space-y-4">
          {beat.licenses.map((license: BeatDetail["licenses"][number]) => {
            const type = license.licenseType;
            const features = licenseBenefits[type] ?? ["Licencia digital"];
            const isHighlighted = type === "PREMIUM";
            return (
              <div
                key={license.id}
                className={`rounded-3xl border bg-white/5 p-5 ${
                  isHighlighted
                    ? "border-pink-400/40 shadow-lg shadow-pink-500/20"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                      {licenseLabels[type] || type}
                    </p>
                    <p className="text-3xl font-semibold">
                      {formatCurrency(license.priceCents, license.currency)}
                    </p>
                  </div>
                  {isHighlighted && (
                    <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-200">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/60">
                  Entrega:{" "}
                  {deliveryLabels[license.delivery] || license.delivery}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {features.map((feature) => (
                    <li
                      key={`${license.id}-${feature}`}
                      className="flex items-center gap-2"
                    >
                      <Check size={14} className="text-pink-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {license.terms && (
                  <p className="mt-3 text-xs text-white/60">{license.terms}</p>
                )}
                <div className="mt-4">
                  <CheckoutForm
                    licenseId={license.id}
                    licenseLabel={licenseLabels[type] || type}
                  />
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
