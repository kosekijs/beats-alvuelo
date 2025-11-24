import clsx from "clsx";

interface ButtonOptions {
  variant?: "primary" | "ghost" | "secondary";
}

export function buttonVariants({ variant = "primary" }: ButtonOptions = {}) {
  switch (variant) {
    case "ghost":
      return clsx(
        "px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white"
      );
    case "secondary":
      return clsx(
        "px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
      );
    default:
      return clsx(
        "px-4 py-2 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white font-medium shadow-lg shadow-pink-500/30 hover:opacity-90"
      );
  }
}
