import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const beatSchema = z.object({
  title: z.string().min(2),
  description: z.string().max(500).optional(),
  genre: z.string().optional(),
  bpm: z.number().int().min(60).max(200),
  previewUrl: z.string().url(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  stemsUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  priceBasic: z.number().int().nonnegative(),
  pricePremium: z.number().int().nonnegative(),
  priceExclusive: z.number().int().nonnegative(),
  currency: z.string().length(3),
});

async function buildUniqueBeatSlug(title: string) {
  const base = slugify(title);
  let attempt = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.beat.findUnique({ where: { slug: attempt } });
    if (!existing) {
      return attempt;
    }
    attempt = `${base}-${counter}`;
    counter += 1;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");
  const producerSlug = searchParams.get("producer");

  const beats = await prisma.beat.findMany({
    where: {
      isPublished: true,
      ...(genre ? { genre } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
      ...(producerSlug ? { producer: { slug: producerSlug } } : {}),
    },
    include: {
      licenses: true,
      producer: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return NextResponse.json({ beats });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "PRODUCER") {
    return NextResponse.json({ error: "Solo productores pueden publicar" }, { status: 403 });
  }

  try {
    const payload = beatSchema.parse(await req.json());
    const slug = await buildUniqueBeatSlug(payload.title);

    const licensesData = [
      payload.priceBasic > 0 && {
        licenseType: "BASIC",
        delivery: "MP3_WAV",
        priceCents: payload.priceBasic,
        currency: payload.currency,
      },
      payload.pricePremium > 0 && {
        licenseType: "PREMIUM",
        delivery: "MP3_WAV",
        priceCents: payload.pricePremium,
        currency: payload.currency,
      },
      payload.priceExclusive > 0 && {
        licenseType: "EXCLUSIVE",
        delivery: "STEMS",
        priceCents: payload.priceExclusive,
        currency: payload.currency,
      },
    ].filter(Boolean) as {
      licenseType: "BASIC" | "PREMIUM" | "EXCLUSIVE";
      delivery: "MP3_WAV" | "STEMS";
      priceCents: number;
      currency: string;
    }[];

    if (licensesData.length === 0) {
      return NextResponse.json(
        { error: "Debes ingresar al menos un precio" },
        { status: 400 }
      );
    }

    const beat = await prisma.beat.create({
      data: {
        title: payload.title,
        slug,
        description: payload.description,
        genre: payload.genre,
        bpm: payload.bpm,
        previewUrl: payload.previewUrl,
        coverUrl: payload.coverUrl || null,
        stemsUrl: payload.stemsUrl || null,
        moodTags: payload.tags || null,
        producerId: session.user.id,
        licenses: {
          create: licensesData,
        },
      },
      include: {
        licenses: true,
        producer: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ beat }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Beat creation error", error);
    return NextResponse.json(
      { error: "No se pudo crear el beat" },
      { status: 500 }
    );
  }
}
