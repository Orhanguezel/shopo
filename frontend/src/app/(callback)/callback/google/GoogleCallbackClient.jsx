"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import LoaderStyleOne from "../../../../components/Helpers/Loaders/LoaderStyleOne";
import ServeLangItem from "@/components/Helpers/ServeLangItem";
import { useLazyGoogleCallbackApiQuery } from "@/redux/features/socialLogin/apiSlice";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [res, setRes] = useState(true);
  const [googleCallbackApi] = useLazyGoogleCallbackApiQuery();

  const handleGoogleCallback = async (query) => {
    const response = await googleCallbackApi(query);
    if (response?.status === "fulfilled") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
        localStorage.setItem("auth", JSON.stringify(response.data));
      }
      router.push("/");
      setRes(false);
      toast.success(
        ServeLangItem()?.Login_Successfully || "Başarıyla Giriş Yapıldı"
      );
    } else {
      setRes(false);
      toast.error(
        ServeLangItem()?.Login_failed_Please_try_again ||
          "Giriş başarısız. Lütfen tekrar deneyin."
      );
      router.push("/login");
    }
  };

  useEffect(() => {
    if (!res) {
      return;
    }

    const authuser = searchParams.get("authuser");
    const code = searchParams.get("code");
    const prompt = searchParams.get("prompt");
    const scope = searchParams.get("scope");

    if (authuser && code && prompt && scope) {
      const urlQuery = `authuser=${authuser}&code=${code}&prompt=${prompt}&scope=${scope}`;
      handleGoogleCallback(urlQuery);
      return;
    }

    setRes(false);
    toast.error(
      ServeLangItem()?.Invalid_callback_parameters ||
        "Geçersiz geri çağrı parametreleri"
    );
    router.push("/login");
  }, [dispatch, res, router, searchParams]);

  if (res) {
    return (
      <div
        className="relative flex h-screen w-full items-center justify-center bg-black bg-opacity-70"
        style={{ zIndex: 999999 }}
      >
        <LoaderStyleOne />
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackClient() {
  return (
    <Suspense
      fallback={
        <div
          className="relative flex h-screen w-full items-center justify-center bg-black bg-opacity-70"
          style={{ zIndex: 999999 }}
        >
          <LoaderStyleOne />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
