import { Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow",
});

export const metadata = {
  title: "Rishabh Parashar | Frontend & AI Automation Developer",
  description:
    "Frontend & AI Automation Developer specialising in React, React Native, Next.js, TypeScript, Firebase, Supabase, and AI workflow automation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
