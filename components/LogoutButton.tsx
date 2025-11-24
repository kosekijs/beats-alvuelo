"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signOut({ callbackUrl: "/" }))}
      className={buttonVariants({ variant: "ghost" })}
      disabled={isPending}
    >
      {isPending ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
