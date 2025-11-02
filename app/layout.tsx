import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pAyI - AI Credit Card Rewards Optimizer",
  description: "Maximize your credit card rewards with AI-powered recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
