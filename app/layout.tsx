import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qatar Financial Simulator - HEARST Solutions",
  description: "Dynamic financial modeling platform for Qatar Bitcoin mining partnership",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}


