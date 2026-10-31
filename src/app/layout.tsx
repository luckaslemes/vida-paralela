import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIDA PARALELA | Seu futuro começa nas decisões de hoje",
  description: "Planeje sua vida, explore possibilidades e tome decisões com mais clareza.",
  applicationName: "VIDA PARALELA",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
