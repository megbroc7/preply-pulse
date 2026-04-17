import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DataProvider } from "@/context/data-context";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PreplyPulse — Insights for Preply Tutors",
  description:
    "Upload your Preply activity CSV and get actionable business insights. Made by a Preply tutor, for Preply tutors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${inter.variable} font-sans antialiased`}
      >
        <DataProvider>{children}</DataProvider>
        <Analytics />
      </body>
    </html>
  );
}
