export default function CheckoutPendingPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
        Pago pendiente
      </p>
      <h1 className="text-3xl font-semibold">Tu pago está en revisión</h1>
      <p className="text-white/70">
        Mercado Pago está verificando la transacción. Recibirás un email con la
        confirmación apenas se apruebe. Puedes cerrar esta ventana con
        tranquilidad.
      </p>
    </div>
  );
}
