import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function Navbar() {
  const session = await auth();
  const navLinks = [
    { href: "/beats", label: "Beats" },
    { href: "/producers", label: "Productores" },
    { href: "/#workflow", label: "Cómo funciona" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          🎛️ BAV
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-600 dark:text-white/70 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-gray-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost" })}
              >
                Mi panel
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "primary" })}
              >
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
