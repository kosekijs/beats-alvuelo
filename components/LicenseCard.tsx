type LicenseCardProps = {
  title: string;
  description: string;
  price: string;
  features: string[];
  highlight?: boolean;
};

export function LicenseCard({
  title,
  description,
  price,
  features,
  highlight,
}: LicenseCardProps) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        highlight
          ? "border-pink-400 bg-white/10 shadow-lg shadow-pink-500/20"
          : "border-white/5 bg-white/5"
      }`}
    >
      <p className="text-sm uppercase tracking-wide text-white/70">{title}</p>
      <h3 className="mt-2 text-3xl font-semibold">{price}</h3>
      <p className="mt-2 text-white/70">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
