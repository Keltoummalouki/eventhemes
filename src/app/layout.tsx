import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { EventhemeProvider } from "@/components/eventheme/Provider";
import { getEntries, localMode } from "@/lib/eventheme/server";
import "./globals.css";

/** Titres et éléments d'affichage. */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

/** Textes courants et interface. */
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default:
      "Eventheme — Organisation, animation & location événementielle au Maroc",
    template: "%s | Eventheme",
  },
  description:
    "Votre événement. Votre vision. Notre savoir-faire. Organisation, animation, décoration et location de matériel événementiel au Maroc.",
  icons: {
    icon: [{ url: "/eventheme_icon.ico", sizes: "32x32" }],
  },
  openGraph: {
    title: "Eventheme — Votre événement. Votre vision. Notre savoir-faire.",
    description:
      "Organisation, animation, décoration et location événementielle au Maroc.",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const dynamic = "force-dynamic";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const entries = await getEntries();
  return (
    <html
      lang="fr"
      className={`${cormorantGaramond.variable} ${manrope.variable}`}
    >
      <body>
        {/* Sans JavaScript, les blocs révélés au défilement restent visibles. */}
        <noscript>
          <style>
            {".reveal{opacity:1 !important;transform:none !important;}"}
          </style>
        </noscript>
        <EventhemeProvider entries={entries} local={localMode()}>
          {children}
        </EventhemeProvider>
      </body>
    </html>
  );
}
