import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    // Validar tipo de archivo (audio o imagen)
    const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validTypes = [...validAudioTypes, ...validImageTypes];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de audio (MP3, WAV, OGG) o imágenes (JPG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande (máx 50MB)" },
        { status: 400 }
      );
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // Usar el token con prefijo bav_ que da Vercel
    const token = process.env.bav_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: "Blob storage no configurado" },
        { status: 500 }
      );
    }

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      token,
    });

    return NextResponse.json({ url: blob.url, fileName: filename }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}
