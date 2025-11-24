import { NextRequest, NextResponse } from "next/server";

function isSignatureValid(req: NextRequest) {
  const configuredSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!configuredSecret) {
    return true;
  }

  const provided =
    req.headers.get("x-mp-signature") || req.headers.get("x-signature");
  return provided === configuredSecret;
}

export async function POST(req: NextRequest) {
  if (!isSignatureValid(req)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = await req.json();
  console.log("Mercado Pago webhook recibido", payload);

  return NextResponse.json({ received: true });
}

export async function GET(req: NextRequest) {
  if (!isSignatureValid(req)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok" });
}
