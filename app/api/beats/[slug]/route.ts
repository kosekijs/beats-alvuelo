import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const beat = await prisma.beat.findUnique({
    where: { slug: params.slug },
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
