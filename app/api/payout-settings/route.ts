import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { alias, cbuCvu, holder } = await request.json();

  if (!cbuCvu || !holder) {
    return NextResponse.json(
      { error: "CBU/CVU y titular son obligatorios" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      payoutAlias: alias || null,
      payoutCbuCvu: cbuCvu,
      payoutHolder: holder,
    },
  });

  return NextResponse.json({ ok: true });
}
