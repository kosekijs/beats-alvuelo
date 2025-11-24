import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ProducerCard = Awaited<ReturnType<typeof prisma.user.findMany>>[number] & {
  _count: {
    beats: number;
  };
  beats: Array<{
    title: string;
    slug: string;
  }>;
};

export default async function ProducersPage() {
  const producers = (await prisma.user.findMany({
    where: { role: "PRODUCER" },
    include: {
      _count: { select: { beats: true } },
      beats: {
        select: { title: true, slug: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  })) as ProducerCard[];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-semibold">
          Productores latinos destacados
        </h1>
        <p className="text-white/70">
          Cada productor cuenta con un perfil público con catálogo y checkout en
          moneda local.
        </p>
      </div>
      {producers.length === 0 ? (
        <p className="text-white/70">
          Aún no hay productores registrados. Sé el primero en publicar tus
          beats.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {producers.map((producer: ProducerCard) => (
            <div
              key={producer.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{producer.name}</h2>
                  <p className="text-sm text-white/60">
                    {producer.country || "Latam"} · {producer._count.beats}{" "}
                    beats
                  </p>
                </div>
                <Link
                  href={`/pro/${producer.slug}`}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm"
                >
                  Ver perfil
                </Link>
              </div>
              {producer.bio && (
                <p className="mt-4 text-white/70">{producer.bio}</p>
              )}
              {producer.beats.length > 0 && (
                <div className="mt-4 text-sm text-white/60">
                  Últimos beats:{" "}
                  {producer.beats.map(
                    (beat: ProducerCard["beats"][number], index: number) => (
                      <span key={beat.slug}>
                        <Link
                          href={`/beats/${beat.slug}`}
                          className="text-pink-300"
                        >
                          {beat.title}
                        </Link>
                        {index < producer.beats.length - 1 && ", "}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
