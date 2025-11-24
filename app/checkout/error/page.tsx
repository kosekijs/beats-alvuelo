export default function CheckoutErrorPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-red-300">
        Pago cancelado
      </p>
      <h1 className="text-3xl font-semibold">No pudimos procesar tu pago</h1>
      <p className="text-white/70">
        Vuelve al catálogo para intentar nuevamente o elige otro método de pago.
        Si el problema persiste, contáctanos con el ID del checkout.
      </p>
    </div>
  );
}
