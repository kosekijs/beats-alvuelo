"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

interface CheckoutFormProps {
  licenseId: string;
  licenseLabel: string;
}

export function CheckoutForm({ licenseId, licenseLabel }: CheckoutFormProps) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!buyerName || !buyerEmail) {
      toast.error("Completa tu nombre y email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId, buyerName, buyerEmail }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "No se pudo iniciar el checkout");
      }

      const data = await response.json();
      const redirectUrl = data.initPoint || data.sandboxInitPoint;
      if (!redirectUrl) {
        throw new Error("Respuesta inválida de Mercado Pago");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-white/60">Tu nombre</label>
        <input
          value={buyerName}
          onChange={(event) => setBuyerName(event.target.value)}
          placeholder="Artista o representante"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs text-white/60">Email de contacto</label>
        <input
          type="email"
          value={buyerEmail}
          onChange={(event) => setBuyerEmail(event.target.value)}
          placeholder="tu@email.com"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-linear-to-r from-pink-500 to-orange-500 py-3 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Redirigiendo..." : `Comprar ${licenseLabel}`}
      </button>
    </form>
  );
}
