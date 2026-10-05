import type { Metadata } from "next";
import { DM_Sans, Zilla_Slab } from "next/font/google";
import "./globals.css";

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Dominio público del sitio: necesario para las vistas previas con foto al compartir
  // enlaces por WhatsApp o redes. Definir NEXT_PUBLIC_SITE_URL al publicar.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "DLC Sport Horses",
  description: "Rancho de crianza de caballos deportivos.",
};

// Solo <html> y <body>: el navbar y el cursor viven en app/(public)/layout.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${zillaSlab.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-dlc-marfil text-dlc-negro font-sans">
        {children}
      </body>
    </html>
  );
}
