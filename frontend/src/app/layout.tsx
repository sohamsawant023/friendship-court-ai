import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Friendship Court AI | Intelligent Dispute Resolution",
  description: "The premium AI-powered courtroom for resolving friendly disputes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-24 pb-12 w-full">
          {children}
        </main>
        <footer className="border-t border-glassBorderSecondary py-8 text-center text-xs text-textSecondary bg-background/50 backdrop-blur-sm mt-auto relative z-10">
          <p className="tracking-widest uppercase opacity-60">Entertainment only — not legal advice.</p>
        </footer>
      </body>
    </html>
  );
}
