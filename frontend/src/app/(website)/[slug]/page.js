"use client";
import React, { Suspense, use } from "react";
import CustomPageCom from "../../../components/CustomPageCom";

function PageWrapContent({ slug }) {
  return (
    <>
      <CustomPageCom slug={slug} />
    </>
  );
}

// Next.js 15'te params asenkron bir nesnedir
export default function PageWrap({ params }) {
  const { slug } = use(params); 

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <PageWrapContent slug={slug} />
    </Suspense>
  );
}
