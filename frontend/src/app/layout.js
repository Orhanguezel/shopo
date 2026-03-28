import appConfig from "@/appConfig";
import "@/app/globals.css";
import AosWrapper from "@/components/Helpers/AosWrapper";
// snake loader
import NextSnakeLoader from "@/components/Helpers/Loaders/NextSnakeLoader";
// external css
import "@/assets/css/loader.css";
import "@/assets/css/selecbox.css";
import { Providers } from "@/redux/providers";
import Toaster from "@/components/Helpers/Toaster";
import localFont from "next/font/local";

const inter = localFont({
  src: [
    { path: "../../public/assets/fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/Inter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(appConfig.APPLICATION_URL),
  title: {
    default: "Berber ve Kuaför Malzemeleri | Seyfibaba",
    template: "%s | Seyfibaba",
  },
  description: "Berber malzemeleri, kuaför ekipmanları, berber koltuğu ve salon mobilyaları. Profesyoneller için en uygun fiyatlı alışveriş sitesi.",
  authors: [{ name: "Seyfibaba", url: appConfig.APPLICATION_URL }],
  publisher: "Seyfibaba",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: appConfig.BASE_URL + "uploads/website-images/favicon.png",
    shortcut: appConfig.BASE_URL + "uploads/website-images/favicon.png",
    apple: appConfig.BASE_URL + "uploads/website-images/favicon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Seyfibaba",
    title: "Berber ve Kuaför Malzemeleri | Seyfibaba",
    description: "Berber malzemeleri, kuaför ekipmanları, berber koltuğu ve salon mobilyaları. Profesyoneller için en uygun fiyatlı alışveriş sitesi.",
    url: appConfig.APPLICATION_URL,
    locale: "tr_TR",
    images: [
      {
        url: appConfig.BASE_URL + "uploads/website-images/logo-2025-12-18-04-53-36-7704.png",
        width: 1200,
        height: 630,
        alt: "Seyfibaba Pazaryeri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@seyfibaba",
    title: "Berber ve Kuaför Malzemeleri | Seyfibaba",
    description: "Berber malzemeleri, kuaför ekipmanları, berber koltuğu ve salon mobilyaları. Profesyoneller için en uygun fiyatlı alışveriş sitesi.",
    images: [appConfig.BASE_URL + "uploads/website-images/logo-2025-12-18-04-53-36-7704.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" translate="no" className="notranslate">
      <head>
        <link rel="preconnect" href="https://admin.seyfibaba.com/" />
        <link rel="dns-prefetch" href="https://admin.seyfibaba.com/" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        {/* SEO: SSR-visible H1 and intro for crawlers */}
        <div id="seo-hero" className="sr-only" aria-hidden="false">
          <h1>Berber ve Kuaför Malzemeleri - Seyfibaba</h1>
          <h2>Profesyonel Berber ve Kuaför Ekipmanları</h2>
          <p>
            Seyfibaba, profesyonel berber ve kuaför salonları için ekipman, mobilya,
            sarf malzeme ve salon teknolojilerini tek noktada bir araya getiren
            Türkiye merkezli bir pazaryeridir. Berber koltuğu, kuaför tezgahı,
            tıraş makineleri, makas setleri, saç bakım ürünleri ve salon
            ekipmanları en uygun fiyatlarla burada.
          </p>
        </div>
        {/* loader */}
        <NextSnakeLoader />
        {/* Toaster container */}
        <Toaster />
        {/* redux provider  & context provider */}
        <Providers>
          <AosWrapper>{children}</AosWrapper>
        </Providers>
      </body>
    </html>
  );
}
