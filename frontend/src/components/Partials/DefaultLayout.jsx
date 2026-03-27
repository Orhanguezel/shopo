import { Suspense } from "react";
import DefaultLayoutClient from "./DefaultLayoutClient";
import HomepageSkeleton from "../Helpers/Loaders/HomepageSkeleton";

export default function DefaultLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-white">
          <HomepageSkeleton />
        </div>
      }
    >
      <DefaultLayoutClient>{children}</DefaultLayoutClient>
    </Suspense>
  );
}
