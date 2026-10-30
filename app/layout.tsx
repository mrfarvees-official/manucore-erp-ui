import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ManuCore ERP",
  description: "Enterprise resource planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body>{children}</body>
    </html>
  );
}