import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

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
      <body className="relative">
        <div className="fixed inset-0 -z-10 bg-hearst-dark"></div>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}


