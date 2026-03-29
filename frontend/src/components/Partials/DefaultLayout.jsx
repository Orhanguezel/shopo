import { Suspense } from "react";
import DefaultLayoutClient from "./DefaultLayoutClient";

export default function DefaultLayout({ children }) {
  return (
    <Suspense
      fallback={
        <main id="main-content">{children}</main>
      }
    >
      <DefaultLayoutClient>{children}</DefaultLayoutClient>
    </Suspense>
  );
}
