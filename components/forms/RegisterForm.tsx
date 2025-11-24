"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.string().optional(),
  bio: z.string().max(280).optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "No se pudo crear la cuenta");
      }

      toast.success("Cuenta creada. Iniciando sesión...");
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm text-white/70">Nombre artístico</label>
        <input
          {...register("name")}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
          placeholder="Beatmaker LATAM"
        />
        {errors.name && (
          <p className="text-sm text-pink-400">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm text-white/70">Email</label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="text-sm text-pink-400">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm text-white/70">Contraseña</label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
          placeholder="Mínimo 6 caracteres"
        />
        {errors.password && (
          <p className="text-sm text-pink-400">{errors.password.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-white/70">País</label>
          <input
            {...register("country")}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
            placeholder="Argentina"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Bio corta</label>
          <input
            {...register("bio")}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
            placeholder="Productor con 5 años de experiencia"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-linear-to-r from-pink-500 to-orange-500 py-3 text-center font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta y publicar beats"}
      </button>
    </form>
  );
}
