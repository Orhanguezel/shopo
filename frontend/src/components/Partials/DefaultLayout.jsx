import { Suspense } from "react";
import DefaultLayoutClient from "./DefaultLayoutClient";

export default function DefaultLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <DefaultLayoutClient>{children}</DefaultLayoutClient>
    </Suspense>
  );
}
