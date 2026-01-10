import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; 
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll"; // Pastikan path ini benar

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evory Wedding Platform",
  description: "The New Standard of Digital Wedding Invitation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} antialiased bg-evory-base text-evory-dark`}
      >
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}