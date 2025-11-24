import clsx from "clsx";

interface ButtonOptions {
  variant?: "primary" | "ghost" | "secondary";
}

export function buttonVariants({ variant = "primary" }: ButtonOptions = {}) {
  switch (variant) {
    case "ghost":
      return clsx(
        "px-4 py-2 rounded-full border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white bg-white dark:bg-transparent"
      );
    case "secondary":
      return clsx(
        "px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20"
      );
    default:
      return clsx(
        "px-4 py-2 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white font-medium shadow-lg shadow-pink-500/30 hover:opacity-90"
      );
  }
}
