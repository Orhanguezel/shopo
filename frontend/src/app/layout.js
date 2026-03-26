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

export default function RootLayout({ children }) {
  const { favicon } = settings();
  return (
    <html lang="en">
      <head>
        {appConfig.PWA_STATUS === 1 ||
          (appConfig.PWA_STATUS === "1" && (
            <link rel="manifest" href="/manifest.json" />
          ))}
        <link
          rel="icon"
          href={`${favicon ? appConfig.BASE_URL + favicon : "/favico.svg"}`}
        />
      </head>
      <body className={`antialiased`} suppressHydrationWarning={true}>
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
