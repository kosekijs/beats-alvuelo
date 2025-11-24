import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beats al Vuelo | Marketplace para Beatmakers LATAM",
  description:
    "Crea tu catálogo, vende beats con licencias flexibles y cobra en moneda local usando Mercado Pago Checkout Pro.",
  metadataBase: new URL(process.env.APP_BASE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#050505] text-white antialiased`}
      >
        <Navbar />
        <Providers>
          <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
