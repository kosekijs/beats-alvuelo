import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    "Crea tu catálogo, vende beats con licencias flexibles y cobra en moneda local.",
  metadataBase: new URL(process.env.APP_BASE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-[#050505] text-gray-900 dark:text-white antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Navbar />
          <Providers>
            <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
              {children}
            </main>
          </Providers>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
