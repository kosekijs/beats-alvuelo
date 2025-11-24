import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { join } from "path";
import { promises as fs } from "fs";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const uploadDir = join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "El archivo supera el máximo permitido (25MB)" },
      { status: 400 }
    );
  }

  const extension = file.name?.split(".").pop() || "mp3";
  const fileName = `${randomUUID()}.${extension}`;
  const filePath = join(uploadDir, fileName);

  await ensureUploadDir();
  await fs.writeFile(filePath, buffer);

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const publicUrl = `${baseUrl}/uploads/${fileName}`;

  return NextResponse.json({ url: publicUrl, fileName });
}
