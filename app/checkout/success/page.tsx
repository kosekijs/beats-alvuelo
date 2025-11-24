export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
        Pago recibido
      </p>
      <h1 className="text-3xl font-semibold">¡Gracias por tu compra!</h1>
      <p className="text-white/70">
        Te enviaremos el acceso a los archivos y contrato de la licencia en tu
        email registrado. Si no los recibes en unos minutos revisa el spam o
        contáctanos.
      </p>
    </div>
  );
}
