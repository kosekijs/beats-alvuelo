import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BeatForm } from "@/components/forms/BeatForm";
import { MercadoPagoConnect } from "@/components/MercadoPagoConnect";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type BeatLicenseEntity = Awaited<
  ReturnType<typeof prisma.beatLicense.findMany>
>[number];

type DashboardBeat = Awaited<
  ReturnType<typeof prisma.beat.findMany>
>[number] & {
  licenses: BeatLicenseEntity[];
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      slug: true,
      mercadopagoConnected: true,
      mercadopagoEmail: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const beats = (await prisma.beat.findMany({
    where: { producerId: session.user.id },
    include: {
      licenses: true,
    },
    orderBy: { createdAt: "desc" },
  })) as DashboardBeat[];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none">
        <p className="text-sm text-gray-600 dark:text-white/60">
          Hola {user.name}
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Administra tu catálogo y comparte tu landing personal.
        </h1>
        <p className="text-gray-600 dark:text-white/60">
          Tu página pública:{" "}
          <Link
            className="font-medium text-pink-600 dark:text-pink-300"
            href={`/pro/${user.slug}`}
          >
            beatsalvuelo.com/pro/{user.slug}
          </Link>
        </p>
      </section>

      <MercadoPagoConnect
        isConnected={user.mercadopagoConnected}
        mercadopagoEmail={user.mercadopagoEmail}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Publica un nuevo beat
          </h2>
          <BeatForm />
        </div>
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tus beats
            </h2>
            <span className="text-sm text-gray-600 dark:text-white/60">
              {beats.length} publicados
            </span>
          </div>
          {beats.length === 0 ? (
            <p className="text-gray-600 dark:text-white/60">
              Aún no publicaste beats. Completa el formulario para cargar tu
              primer release.
            </p>
          ) : (
            <ul className="space-y-4">
              {beats.map((beat: DashboardBeat) => {
                const minPrice = beat.licenses.reduce(
                  (acc: number, license: DashboardBeat["licenses"][number]) => {
                    return Math.min(acc, license.priceCents);
                  },
                  beat.licenses[0]?.priceCents ?? 0
                );
                return (
                  <li
                    key={beat.id}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {beat.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          {beat.genre || "Sin género"} · {beat.bpm} BPM
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/50">
                          Publicado{" "}
                          {formatDistanceToNow(new Date(beat.createdAt), {
                            locale: es,
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-white/60">
                          Desde
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: beat.licenses[0]?.currency || "ARS",
                            minimumFractionDigits: 0,
                          }).format(minPrice / 100)}
                        </p>
                        <Link
                          href={`/beats/${beat.slug}`}
                          className="text-sm text-pink-600 dark:text-pink-300 hover:underline"
                        >
                          Ver ficha
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
