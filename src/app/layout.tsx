import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudySynth",
  description: "Get personalized study guides",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${playfair.variable} ${sourceSans.variable} font-sans antialiased`}
        style={{ fontFamily: 'Source Sans 3, "Source Sans 3 Fallback", var(--font-source-sans), ui-sans-serif, system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
