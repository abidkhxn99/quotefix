import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "QuoteFix — Professional Quotes, Invoices & Contracts for UK Tradespeople",
    template: "%s | QuoteFix",
  },
  description:
    "Create professional quotes, invoices and contracts in 60 seconds. Built for UK builders, electricians, plumbers, cleaners and tradespeople. Branded documents, shareable links, T&Cs builder. Start free.",
  keywords: [
    "quote generator",
    "invoice generator",
    "contract generator",
    "UK tradespeople",
    "builder quotes",
    "electrician invoice",
    "plumber quote",
    "tradesman invoice",
    "professional quotes",
    "quoting software",
    "invoicing app",
    "self employed invoices",
    "UK small business",
  ],
  authors: [{ name: "QuoteFix" }],
  creator: "QuoteFix",
  metadataBase: new URL("https://quotefix.co.uk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://quotefix.co.uk",
    siteName: "QuoteFix",
    title: "QuoteFix — Professional Quotes & Invoices for UK Tradespeople",
    description:
      "Stop sending dodgy WhatsApp quotes. Create professional quotes, invoices and contracts in 60 seconds — branded to your business, ready to send.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "QuoteFix Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "QuoteFix — Quotes & Invoices for UK Tradespeople",
    description:
      "Create professional quotes, invoices and contracts in 60 seconds. Built for tradespeople.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
