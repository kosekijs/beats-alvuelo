"use client";

"use client";

import { useState } from "react";
import { CheckCircle2, InfoIcon } from "lucide-react";

interface PayoutFormProps {
  initialAlias?: string | null;
  initialCbuCvu?: string | null;
  initialHolder?: string | null;
}

export function MercadoPagoConnect({
  initialAlias,
  initialCbuCvu,
  initialHolder,
}: PayoutFormProps) {
  const [alias, setAlias] = useState(initialAlias ?? "");
  const [cbuCvu, setCbuCvu] = useState(initialCbuCvu ?? "");
  const [holder, setHolder] = useState(initialHolder ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasData = !!(initialAlias || initialCbuCvu || initialHolder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/payout-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, cbuCvu, holder }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los datos de cobro");
      }

      setMessage("Datos de cobro guardados correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("No se pudieron guardar los datos. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 p-6">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Datos para recibir tus cobros
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Vamos a depositarte tus ganancias por ventas de beats en esta cuenta
            bancaria/virtual (Argentina).
          </p>
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <InfoIcon className="w-4 h-4 mt-0.5" />
            <p>
              Usamos estos datos solo para transferirte lo recaudado. Los pagos
              de los compradores se acreditan primero en nuestra cuenta y luego
              te liquidamos tu parte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Alias (opcional)
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="mi.alias.banco"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                CBU / CVU
              </label>
              <input
                type="text"
                value={cbuCvu}
                onChange={(e) => setCbuCvu(e.target.value)}
                placeholder="0000000000000000000000"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Titular de la cuenta
              </label>
              <input
                type="text"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="Nombre y apellido del titular"
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white px-6 py-2 text-sm font-medium shadow-lg shadow-blue-500/30 hover:opacity-90 transition disabled:opacity-60"
            >
              {isSaving
                ? "Guardando datos de cobro..."
                : hasData
                ? "Actualizar datos de cobro"
                : "Guardar datos de cobro"}
            </button>
          </form>

          {message && (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
