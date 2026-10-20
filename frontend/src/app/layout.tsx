import type { Metadata } from "next";
import { Bodoni_Moda, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const display = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Star Hotel",
    template: "%s — Star Hotel",
  },
  description: "Star Hotel, en Zona 10 de la Ciudad de Guatemala. Habitaciones, tarifas y servicios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${outfit.variable} ${display.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
