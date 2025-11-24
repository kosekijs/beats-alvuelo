"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

const beatSchema = z.object({
  title: z.string().min(2),
  description: z.string().max(500).optional(),
  genre: z.string().optional(),
  bpm: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value) && value >= 60 && value <= 200, {
      message: "BPM entre 60 y 200",
    }),
  previewUrl: z.string().url({ message: "URL del preview requerida" }),
  coverUrl: z.string().url().optional().or(z.literal("")),
  stemsUrl: z.string().url().optional().or(z.literal("")),
  currency: z.string().length(3).default("ARS"),
  priceBasic: z.union([z.string(), z.number()]).transform(Number),
  pricePremium: z.union([z.string(), z.number()]).transform(Number),
  priceExclusive: z.union([z.string(), z.number()]).transform(Number),
  tags: z.string().optional(),
});

type BeatValues = z.infer<typeof beatSchema>;

export function BeatForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeatValues>({
    resolver: zodResolver(beatSchema),
    defaultValues: {
      currency: "ARS",
      bpm: 140,
      priceBasic: 15000,
      pricePremium: 35000,
      priceExclusive: 120000,
    } as any,
  });

  const previewUrlValue = watch("previewUrl");

  const handlePreviewUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingPreview(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "No se pudo subir el archivo");
      }

      const data = await response.json();
      setValue("previewUrl", data.url, { shouldValidate: true });
      toast.success("Preview cargado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setUploadingPreview(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (values: BeatValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        bpm: Number(values.bpm),
        priceBasic: Math.round(Number(values.priceBasic) * 100),
        pricePremium: Math.round(Number(values.pricePremium) * 100),
        priceExclusive: Math.round(Number(values.priceExclusive) * 100),
      };

      const response = await fetch("/api/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "No se pudo crear el beat");
      }

      toast.success("Beat publicado");
      reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: keyof BeatValues,
    label: string,
    placeholder: string,
    type: string = "text"
  ) => (
    <div>
      <label className="text-sm text-white/70">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
      />
      {errors[name] && (
        <p className="text-sm text-pink-400">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {renderInput("title", "Título", "Beat trap 2024")}
      {renderInput("genre", "Género", "Trap")}
      {renderInput("bpm", "BPM", "140", "number")}
      <div className="space-y-3">
        <div>
          <label className="text-sm text-white/70">Preview MP3/WAV</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              type="file"
              accept="audio/*"
              onChange={handlePreviewUpload}
              disabled={uploadingPreview}
              className="w-full rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-none file:bg-white/10 file:px-4 file:py-2 file:text-sm"
            />
            {previewUrlValue && (
              <a
                href={previewUrlValue}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/20 px-4 py-3 text-center text-sm text-white/80"
              >
                Ver archivo
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-white/60">
            También puedes pegar una URL pública si prefieres alojarla en otro
            servicio.
          </p>
        </div>
        {renderInput("previewUrl", "URL del preview (MP3)", "https://...")}
      </div>
      {renderInput("coverUrl", "Cover opcional", "https://img...")}
      {renderInput("stemsUrl", "Stems opcionales", "https://drive...")}
      <div>
        <label className="text-sm text-white/70">Descripción</label>
        <textarea
          {...register("description")}
          placeholder="Menciona mood, influencias y detalles"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
          rows={3}
        />
      </div>
      {renderInput("tags", "Tags (coma separadas)", "drill, oscuro")}
      <div>
        <label className="text-sm text-white/70">Moneda</label>
        <select
          {...register("currency")}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
        >
          <option value="ARS">ARS</option>
          <option value="MXN">MXN</option>
          <option value="CLP">CLP</option>
          <option value="COP">COP</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {renderInput("priceBasic", "Licencia básica", "15000", "number")}
        {renderInput("pricePremium", "Licencia premium", "35000", "number")}
        {renderInput(
          "priceExclusive",
          "Licencia exclusiva",
          "120000",
          "number"
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-linear-to-r from-pink-500 to-orange-500 py-3 text-center font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Publicando..." : "Publicar beat"}
      </button>
    </form>
  );
}
