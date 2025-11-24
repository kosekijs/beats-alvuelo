import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BeatCard, type BeatCardData } from "@/components/BeatCard";

const labelByGenre = (genre: string | null) => genre || "Sin género";

type CatalogBeat = Awaited<ReturnType<typeof prisma.beat.findMany>>[number];
type GenreOption = Awaited<ReturnType<typeof prisma.beat.groupBy>>[number];
type ProducerOption = Awaited<ReturnType<typeof prisma.user.findMany>>[number];

type BeatsSearchParams = Record<string, string | string[] | undefined>;

export default async function BeatsCatalog({
  searchParams,
}: {
  searchParams: BeatsSearchParams;
}) {
  const params = await Promise.resolve(searchParams);
  const search = typeof params.search === "string" ? params.search : undefined;
  const genre = typeof params.genre === "string" ? params.genre : undefined;
  const producer =
    typeof params.producer === "string" ? params.producer : undefined;

  const [beats, genreOptions, producerOptions] = await Promise.all([
    prisma.beat.findMany({
      where: {
        isPublished: true,
        ...(genre ? { genre } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { genre: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(producer ? { producer: { slug: producer } } : {}),
      },
      include: {
        licenses: true,
        producer: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.beat.groupBy({
      by: ["genre"],
      where: { isPublished: true, genre: { not: null } },
      _count: { _all: true },
      orderBy: { genre: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "PRODUCER" },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const cards: BeatCardData[] = beats.map((beat: CatalogBeat) => ({
    id: beat.id,
    title: beat.title,
    slug: beat.slug,
    description: beat.description,
    genre: beat.genre,
    coverUrl: beat.coverUrl,
    previewUrl: beat.previewUrl,
    licenses: beat.licenses.map((license: CatalogBeat["licenses"][number]) => ({
      id: license.id,
      priceCents: license.priceCents,
      currency: license.currency,
    })),
    producer: beat.producer,
  }));

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
          Catálogo curado
        </p>
        <h1 className="mt-2 text-4xl font-semibold">
          Busca beats por género, mood o productor.
        </h1>
        <p className="text-white/70">
          Filtra por licencias disponibles y comparte el checkout con tus
          clientes.
        </p>
      </header>

      <form
        className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-4"
        method="GET"
      >
        <input
          name="search"
          placeholder="Buscar título, mood o keyword"
          defaultValue={search}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
        />
        <select
          name="genre"
          defaultValue={genre || ""}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
        >
          <option value="">Todos los géneros</option>
          {genreOptions
            .filter((option: GenreOption) => option.genre)
            .map((option: GenreOption) => (
              <option key={option.genre} value={option.genre ?? ""}>
                {labelByGenre(option.genre)}
              </option>
            ))}
        </select>
        <select
          name="producer"
          defaultValue={producer || ""}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
        >
          <option value="">Todos los productores</option>
          {producerOptions.map((option: ProducerOption) => (
            <option key={option.slug} value={option.slug}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-linear-to-r from-pink-500 to-orange-500 font-semibold"
          >
            Filtrar
          </button>
          {(search || genre || producer) && (
            <Link
              href="/beats"
              className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm text-white/80"
            >
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {cards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/20 bg-black/30 p-8 text-center">
          <p className="text-lg font-semibold text-white">Sin resultados</p>
          <p className="text-white/70">
            Ajusta los filtros o vuelve pronto para descubrir nuevos beats.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      )}
    </div>
  );
}
