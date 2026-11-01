import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "KNOWVIA — Discover. Learn. Understand.",
    template: "%s | KNOWVIA",
  },
  description:
    "A modern knowledge and article publication covering AI, technology, science, psychology, society, culture, and discoveries.",
  keywords: [
    "KNOWVIA",
    "knowledge platform",
    "articles",
    "AI",
    "science",
    "psychology",
    "technology",
    "discoveries",
  ],
  authors: [{ name: "KNOWVIA Editorial" }],
  creator: "KNOWVIA",
  publisher: "KNOWVIA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "KNOWVIA — Discover. Learn. Understand.",
    description:
      "Curated knowledge and deep-dive articles exploring ideas shaping our future.",
    url: "https://knowvia.com",
    siteName: "KNOWVIA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KNOWVIA — Discover. Learn. Understand.",
    description:
      "Curated knowledge and deep-dive articles exploring ideas shaping our future.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
