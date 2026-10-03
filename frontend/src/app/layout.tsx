import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ClaimMate · The Modern Bahi-Khata for Indian Insurance",
  description: "A multilingual AI claim copilot for Indian insurance, built on Sarvam AI. The AI reads and explains, deterministic code calculates, and you decide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-[#F3EFE6] text-[#151513]">
        {children}
      </body>
    </html>
  );
}
