import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== "PRODUCER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mercadopagoUserId: null,
        mercadopagoToken: null,
        mercadopagoEmail: null,
        mercadopagoConnected: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MP disconnect error:", error);
    return NextResponse.json(
      { error: "Error al desconectar Mercado Pago" },
      { status: 500 }
    );
  }
}
