"use client";
import Script from "next/script";
import React from "react";

function GoogleTagManager({ gTagId }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gTagId}`}
        strategy="lazyOnload"
      ></Script>
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gTagId}');
        `}
      </Script>
    </>
  );
}

export default GoogleTagManager;
