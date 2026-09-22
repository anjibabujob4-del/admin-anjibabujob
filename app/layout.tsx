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
  title: "ANJIBABUJOB.COM — Better Jobs, Brighter Future",
  description: "Find the best jobs in Hyderabad and across India. All types of workers needed. Your Needs, Our Priority.",
  openGraph: {
    title: "ANJIBABUJOB.COM — Better Jobs, Brighter Future",
    description: "Find the best jobs in India. All types of workers needed.",
    siteName: "ANJIBABUJOB.COM",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
