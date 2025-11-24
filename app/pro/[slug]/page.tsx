import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BeatCard, type BeatCardData } from "@/components/BeatCard";

export default async function ProducerProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producer = await prisma.user.findUnique({
    where: { slug },
    include: {
      beats: {
        where: { isPublished: true },
        include: { licenses: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!producer) {
    notFound();
  }

  const beatCards: BeatCardData[] = producer.beats.map(
    (beat: (typeof producer.beats)[number]) => ({
      id: beat.id,
      title: beat.title,
      slug: beat.slug,
      description: beat.description,
      genre: beat.genre,
      coverUrl: beat.coverUrl,
      previewUrl: beat.previewUrl,
      licenses: beat.licenses.map(
        (license: (typeof beat.licenses)[number]) => ({
          id: license.id,
          priceCents: license.priceCents,
          currency: license.currency,
        })
      ),
      producer: {
        name: producer.name,
        slug: producer.slug,
      },
    })
  );

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
          Beatmaker LATAM
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{producer.name}</h1>
        <p className="text-white/70">
          {producer.bio || "Productor independiente"}
        </p>
        <p className="text-sm text-white/50">
          {producer.country || "Latinoamérica"} · {producer.beats.length} beats
          disponibles
        </p>
      </div>
      {beatCards.length === 0 ? (
        <p className="text-white/70">Este productor aún no publicó beats.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beatCards.map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      )}
    </div>
  );
}
