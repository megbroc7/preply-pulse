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
    "Stop chasing trials. Upload your Preply activity CSV and see what's actually driving your income. Free, private, no sign-up. Made by a Preply tutor, for Preply tutors.",
  metadataBase: new URL("https://preplypulse.com"),
  openGraph: {
    title: "PreplyPulse — Stop chasing trials. Start reading your numbers.",
    description:
      "Upload your Preply CSV and instantly see retention, pricing, student quality, and where your income actually comes from. Free and 100% private.",
    url: "https://preplypulse.com",
    siteName: "PreplyPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PreplyPulse — Stop chasing trials. Start reading your numbers.",
    description:
      "Upload your Preply CSV and instantly see retention, pricing, student quality, and where your income actually comes from.",
  },
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
