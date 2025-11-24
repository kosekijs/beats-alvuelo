import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[90vh] w-full max-w-5xl flex-col gap-10 px-4 py-16 sm:flex-row">
      <div className="flex-1 space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
          Beatmakers LATAM
        </p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Crea tu landing personal, publica beats y cobra con Mercado Pago.
        </h1>
        <p className="text-lg text-white/70">
          Completa el formulario para generar tu cuenta gratuita. Podrás subir
          tu catálogo, definir precios por licencia (MP3, WAV, stems) y
          compartir tu perfil único.
        </p>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/70">Incluye:</p>
          <ul className="mt-3 space-y-2 text-white/90">
            <li>• Tienda pública con URL personalizada</li>
            <li>• Control total de licencias y formatos</li>
            <li>• Cobros locales con Checkout Pro</li>
          </ul>
        </div>
      </div>
      <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6">
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-white/60">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-pink-300 hover:text-pink-100">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
