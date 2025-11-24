"use client";

import { useState } from "react";
import { CheckCircle2, Link as LinkIcon, AlertCircle } from "lucide-react";

interface MercadoPagoConnectProps {
  isConnected: boolean;
  mercadopagoEmail?: string | null;
}

export function MercadoPagoConnect({
  isConnected,
  mercadopagoEmail,
}: MercadoPagoConnectProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (
      !confirm(
        "¿Estás seguro de desconectar tu cuenta de Mercado Pago? No podrás recibir pagos."
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/mercadopago/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Error al desconectar. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      alert("Error al desconectar. Intenta de nuevo.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="rounded-2xl border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mercado Pago conectado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Estás recibiendo pagos en:{" "}
              <span className="font-medium">{mercadopagoEmail}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Los compradores pagan directamente a tu cuenta. Cobramos 10% de
              comisión por cada venta.
            </p>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {isDisconnecting ? "Desconectando..." : "Desconectar cuenta"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conecta tu cuenta de Mercado Pago
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Para recibir pagos de tus beats, necesitás autorizar que los
            compradores paguen directo a tu cuenta.
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-500 mt-3 space-y-1">
            <li>• Los pagos llegan directo a tu cuenta de MP</li>
            <li>• Cobramos 10% de comisión por cada venta</li>
            <li>• Podés desconectar cuando quieras</li>
          </ul>
          <a
            href="/api/mercadopago/connect"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-2.5 text-sm font-medium shadow-lg shadow-blue-500/30 hover:opacity-90 transition"
          >
            <LinkIcon size={16} />
            Conectar con Mercado Pago
          </a>
        </div>
      </div>
    </div>
  );
}
