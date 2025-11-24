import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-white/60">
              © {currentYear} Beats al Vuelo
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
            <span>Desarrollado por</span>
            <Link
              href="https://critikal.software"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/critikal.png"
                alt="Critikal Software"
                width={120}
                height={24}
                className="dark:invert"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
