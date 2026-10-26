import type { Metadata } from "next";
import { Geist, Geist_Mono, Big_Shoulders, Courier_Prime } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Identidade visual: Big Shoulders Display nos títulos (condensada, caixa
// alta) e Courier New nos textos de apoio — Courier Prime só entra como
// reserva onde o Courier New do sistema não existe (ex.: Android).
const bigShoulders = Big_Shoulders({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, faviconUrl } = await getSiteSettings();
  // Uma única fonte pro ícone (editável em Configurações): evita as
  // versões diferentes que cada navegador pegava dos arquivos antigos.
  const icon = faviconUrl || "/site-icon.png";
  return {
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    description: "Notícias e reportagens especiais",
    icons: {
      icon: [{ url: icon }],
      shortcut: [{ url: icon }],
      apple: [{ url: faviconUrl || "/apple-touch-icon.png" }],
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col bg-white text-neutral-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
