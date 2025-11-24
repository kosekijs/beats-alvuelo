import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[90vh] w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:flex-row">
      <div className="flex-1 space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
          Bienvenido
        </p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Ingresa para administrar tu catálogo y ver métricas.
        </h1>
        <p className="text-lg text-white/70">
          Si aún no tienes cuenta puedes registrarte gratis y empezar a vender
          tus beats con licencias claras. Solo necesitas tu email y un preview
          del beat.
        </p>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/70">Incluye:</p>
          <ul className="mt-3 space-y-2 text-white/90">
            <li>• Estadísticas básicas de reproducciones</li>
            <li>• Gestión de licencias y precios</li>
            <li>• Integración directa con Checkout Pro</li>
          </ul>
        </div>
      </div>
      <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6">
        <LoginForm />
        <p className="mt-6 text-center text-sm text-white/60">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/register" className="text-pink-300 hover:text-pink-100">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
