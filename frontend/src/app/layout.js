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
import settings from "@/utils/settings";
import localFont from "next/font/local";

const inter = localFont({
  src: [
    { path: "../../public/assets/fonts/Inter-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/assets/fonts/Inter-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/Inter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/assets/fonts/Inter-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/assets/fonts/Inter-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata() {
  const { favicon, seo_title, seo_description } = settings();
  return {
    metadataBase: new URL(appConfig.APPLICATION_URL),
    title: {
      default: seo_title || "Shopo - E-Ticaret Pazaryeri",
      template: `%s | Shopo`,
    },
    description: seo_description || "Shopo ile güvenli ve hızlı alışverişin tadını çıkarın.",
    icons: {
      icon: favicon ? appConfig.BASE_URL + favicon : "/favico.svg",
      shortcut: favicon ? appConfig.BASE_URL + favicon : "/favico.svg",
      apple: favicon ? appConfig.BASE_URL + favicon : "/favico.svg",
    },
    manifest: appConfig.PWA_STATUS === 1 || appConfig.PWA_STATUS === "1" ? "/manifest.json" : null,
    openGraph: {
      type: "website",
      siteName: "Seyfibaba",
      title: seo_title,
      description: seo_description,
      url: appConfig.APPLICATION_URL,
      locale: "tr_TR",
      images: [
        {
          url: `${appConfig.BASE_URL}uploads/website-images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: "Seyfibaba Pazaryeri",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo_title,
      description: seo_description,
      images: [`${appConfig.BASE_URL}uploads/website-images/og-default.jpg`],
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" translate="no" className="notranslate">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
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
