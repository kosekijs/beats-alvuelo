import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.string().optional(),
  bio: z.string().max(280).optional(),
});

async function buildUniqueSlug(base: string) {
  let slug = slugify(base);
  let counter = 1;
  while (true) {
    const existing = await prisma.user.findUnique({ where: { slug } });
    if (!existing) {
      return slug;
    }
    slug = `${slugify(base)}-${counter}`;
    counter += 1;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    const slug = await buildUniqueSlug(data.name);
    const hashedPassword = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        country: data.country,
        bio: data.bio,
        slug,
      },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Register error", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta" },
      { status: 500 }
    );
  }
}
