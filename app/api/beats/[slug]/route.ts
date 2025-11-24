import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { slug: string };
type Context = { params: Params } | { params: Promise<Params> };

const resolveParams = async (params: Params | Promise<Params>) =>
  params instanceof Promise ? params : Promise.resolve(params);

export async function GET(_request: Request, context: Context) {
  const { slug } = await resolveParams(context.params);
  const beat = await prisma.beat.findUnique({
    where: { slug },
    include: {
      licenses: true,
      producer: {
        select: {
          name: true,
          slug: true,
          country: true,
          bio: true,
        },
      },
    },
  });

  if (!beat) {
    return NextResponse.json({ error: "Beat no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ beat });
}
