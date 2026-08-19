import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LocaleProvider } from "@/lib/locale";
import { CartProvider } from "@/lib/cart";
import "@/styles/globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shooting Complex — ShootingQ8, Kuwait",
  description:
    "A shooting complex in Kuwait. Rifle, pistol, shotgun and archery, under supervision. Behind Al Murooj and the Hunting and Equestrian Club.",
  applicationName: "ShootingQ8",
  openGraph: {
    title: "Shooting Complex — ShootingQ8",
    description:
      "A shooting complex in Kuwait. Rifle, pistol, shotgun and archery, under supervision.",
    type: "website",
    locale: "en_KW",
  },
  icons: { icon: "/brand/logo-mark.png" },
};

export const viewport: Viewport = {
  themeColor: "#101010",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  /* The hero runs edge to edge; safe-area insets are handled in CSS. */
  viewportFit: "cover",
  /* Zoom is never disabled — pinch-zoom stays available. */
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${archivo.variable} ${plexArabic.variable}`}>
      <body>
        <LocaleProvider>
          <CartProvider>{children}</CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
