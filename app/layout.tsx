import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MLM Bubble Visualization",
  description: "Multi-level marketing downline visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

