import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  title: "formAI — The Webflow-Native AI Form Builder",
  description:
    "AI-powered multi-step form builder for modern websites. Describe your form in plain English, AI generates it, embed anywhere with one click.",
  keywords: [
    "AI form builder",
    "Webflow forms",
    "multi-step forms",
    "form builder",
    "conditional logic forms",
    "embed forms",
    "no-code forms",
  ],
  openGraph: {
    title: "formAI — The Webflow-Native AI Form Builder",
    description:
      "AI-powered multi-step form builder for modern websites. Describe your form in plain English, AI generates it, embed anywhere with one click.",
    siteName: "formAI",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "formAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "formAI — The Webflow-Native AI Form Builder",
    description:
      "AI-powered multi-step form builder for modern websites. Describe your form in plain English, AI generates it, embed anywhere with one click.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
