import type { Metadata, Viewport } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import { TransitionProvider } from "./components/Transition";
import NavV2 from "./components/v2/NavV2";
import IntroV2 from "./components/v2/IntroV2";
import ThreeEgg from "./components/v2/ThreeEgg";
import PageRulers from "./components/v2/PageRulers";

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--ff-display",
  display: "swap",
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--ff-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rp3-pi.vercel.app"),
  title: {
    default: "Rishabh Parashar — AI Engineer",
    template: "%s — Rishabh Parashar",
  },
  description:
    "Rishabh Parashar is an AI engineer building on-premise LLM agents, voice AI in English, Hindi and Hinglish, and computer vision. Based in Noida, India.",
  openGraph: {
    title: "Rishabh Parashar — AI that actually ships",
    description: "AI engineer: LLM agents with tool calling, voice AI in Indian languages, computer vision and model fine-tuning.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Enable motion pre-states only when JS runs — content is never hidden without it */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=document.documentElement;h.classList.add('js-motion');try{if(location.pathname==='/'&&!sessionStorage.getItem('intro-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('intro-on')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <IntroV2 />
        <ThreeEgg />
        <PageRulers />
        <SmoothScroll>
          <TransitionProvider>
            <NavV2 />
            <div className="page">{children}</div>
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
