import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MP_CLIENT_ID = process.env.MERCADOPAGO_CLIENT_ID;
const MP_REDIRECT_URI = `${process.env.APP_BASE_URL}/api/mercadopago/callback`;

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "PRODUCER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!MP_CLIENT_ID) {
    return NextResponse.json(
      { error: "Mercado Pago no configurado" },
      { status: 500 }
    );
  }

  // URL de autorización de Mercado Pago
  const authUrl = new URL("https://auth.mercadopago.com/authorization");
  authUrl.searchParams.set("client_id", MP_CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("platform_id", "mp");
  authUrl.searchParams.set("redirect_uri", MP_REDIRECT_URI);
  authUrl.searchParams.set("state", session.user.id); // Para validar el callback

  return NextResponse.redirect(authUrl.toString());
}
