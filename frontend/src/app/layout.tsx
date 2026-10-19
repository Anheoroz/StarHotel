import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Habitaciones disponibles — Hotel 5 Estrellas",
    template: "%s — Hotel 5 Estrellas",
  },
  description:
    "Catálogo de habitaciones de Star Hotel. Filtra por fecha, huéspedes, precio y amenidades.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
