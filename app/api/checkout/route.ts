import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";

const requestSchema = z.object({
  licenseId: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(2),
});

const formatUnitPrice = (priceCents: number) => priceCents / 100;

const normalizeBaseUrl = (input?: string | null) => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
};

const buildUrl = (pathname: string, base: string) =>
  new URL(pathname, base).toString();

export async function POST(request: Request) {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno" },
      { status: 500 }
    );
  }

  const resolvedBaseUrl =
    normalizeBaseUrl(process.env.APP_BASE_URL) ??
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    (process.env.VERCEL_URL
      ? normalizeBaseUrl(process.env.VERCEL_URL)
      : "http://localhost:3000");

  if (process.env.NODE_ENV !== "production") {
    console.log("[checkout] Base URL config", {
      APP_BASE_URL: process.env.APP_BASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      resolvedBaseUrl,
    });
  }

  if (!resolvedBaseUrl) {
    return NextResponse.json(
      {
        error:
          "No se pudo determinar APP_BASE_URL. Configura APP_BASE_URL o NEXT_PUBLIC_APP_URL con un dominio válido.",
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const license = await prisma.beatLicense.findUnique({
    where: { id: parsed.data.licenseId },
    include: {
      beat: {
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          producer: {
            select: {
              id: true,
              name: true,
              slug: true,
              mercadopagoToken: true,
              mercadopagoConnected: true,
            },
          },
        },
      },
    },
  });

  if (!license || !license.beat?.isPublished) {
    return NextResponse.json(
      { error: "Licencia no disponible" },
      { status: 404 }
    );
  }

  // Verificar que el productor tenga MP conectado
  if (!license.beat.producer.mercadopagoConnected || !license.beat.producer.mercadopagoToken) {
    return NextResponse.json(
      { error: "El productor debe conectar su cuenta de Mercado Pago" },
      { status: 400 }
    );
  }

  // Usar el token del productor para el marketplace
  const client = new MercadoPagoConfig({
    accessToken: license.beat.producer.mercadopagoToken,
  });
  const preferenceClient = new Preference(client);
  const notificationUrl =
    process.env.MERCADOPAGO_WEBHOOK_URL ||
    buildUrl("/api/payments/webhook", resolvedBaseUrl);

  // Calcular fee del marketplace (10%)
  const MARKETPLACE_FEE_PERCENT = 0.10;
  const marketplaceFee = Math.round(license.priceCents * MARKETPLACE_FEE_PERCENT);

  try {
    const response = await preferenceClient.create({
      body: {
        items: [
          {
            id: license.id,
            title: `${license.beat.title} · ${license.licenseType}`,
            description:
              license.terms || `Licencia ${license.licenseType} para uso musical`,
            quantity: 1,
            unit_price: formatUnitPrice(license.priceCents),
            currency_id: license.currency,
          },
        ],
        payer: {
          name: parsed.data.buyerName,
          email: parsed.data.buyerEmail,
        },
        metadata: {
          licenseId: license.id,
          beatId: license.beat.id,
          beatSlug: license.beat.slug,
          producerSlug: license.beat.producer.slug,
          producerId: license.beat.producer.id,
          licenseType: license.licenseType,
          marketplaceFee: marketplaceFee.toString(),
        },
        back_urls: {
          success: buildUrl("/checkout/success", resolvedBaseUrl),
          pending: buildUrl("/checkout/pending", resolvedBaseUrl),
          failure: buildUrl("/checkout/error", resolvedBaseUrl),
        },
        auto_return: "approved",
        notification_url: notificationUrl,
        statement_descriptor: "BEATS AL VUELO",
      },
    });

    return NextResponse.json(
      {
        id: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Mercado Pago preference error", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el checkout" },
      { status: 500 }
    );
  }
}
