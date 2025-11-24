import { LicenseCard } from "@/components/LicenseCard";

const tiers = [
  {
    title: "Básica",
    description: "Uso no comercial, redes sociales y promos",
    price: "Desde $15.000",
    features: ["Archivo MP3 320kbps", "Hasta 10k streams", "Sin stems"],
  },
  {
    title: "Premium",
    description: "Uso comercial + plataformas digitales",
    price: "Desde $35.000",
    features: [
      "Archivos WAV + MP3",
      "Hasta 100k streams",
      "Monetización en YouTube",
    ],
    highlight: true,
  },
  {
    title: "Exclusiva",
    description: "Transferencia total + stems",
    price: "Desde $120.000",
    features: ["Entrega de stems", "Streams ilimitados", "Contrato digital"],
  },
];

export default function LicensesPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-semibold">Tipos de licencias</h1>
        <p className="text-white/70">
          Define precios en moneda local para cada licencia. Tus clientes
          reciben un contrato auto-generado y acceso inmediato a los archivos
          correspondientes.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <LicenseCard key={tier.title} {...tier} />
        ))}
      </div>
    </div>
  );
}
