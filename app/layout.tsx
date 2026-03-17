import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { currentConfig } from "@/lib/tenantCOnfig"; // Importamos la config de Torque Lab
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${currentConfig.tenantName} - Scrum Manager`,
  description: currentConfig.poweredByLabel,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          // Inyectamos los colores reales del cliente como variables de CSS
          // Esto permite que TODA la app los use sin repetir el código del color
          "--color-primary": currentConfig.primaryColor,
          "--color-secondary": currentConfig.secondaryColor,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}