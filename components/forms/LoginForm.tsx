"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Credenciales inválidas");
      setLoading(false);
      return;
    }

    toast.success("Bienvenido de vuelta");
    window.location.assign("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••"
        />
        {errors.password && (
          <p className="text-sm text-pink-400">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-linear-to-r from-pink-500 to-orange-500 py-3 text-center font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
