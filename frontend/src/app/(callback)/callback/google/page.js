"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoaderStyleOne from "../../../../components/Helpers/Loaders/LoaderStyleOne";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useLazyGoogleCallbackApiQuery } from "@/redux/features/socialLogin/apiSlice";
import ServeLangItem from "@/components/Helpers/ServeLangItem";

function GooglePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [res, setRes] = useState(true);

  // api initialization
  const [googleCallbackApi] = useLazyGoogleCallbackApiQuery();

  // handle google callback
  const handleGoogleCallback = async (query) => {
    const response = await googleCallbackApi(query);
    if (response?.status === "fulfilled") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
        localStorage.setItem("auth", JSON.stringify(response.data));
      }
      router.push("/");
      setRes(false);
      toast.success(ServeLangItem()?.Login_Successfully || "Başarıyla Giriş Yapıldı");
    } else {
      setRes(false);
      toast.error(ServeLangItem()?.Login_failed_Please_try_again || "Giriş başarısız. Lütfen tekrar deneyin.");
      router.push("/login");
    }
  };

  // use effect to handle google callback
  useEffect(() => {
    if (res) {
      const authuser = searchParams.get("authuser");
      const code = searchParams.get("code");
      const prompt = searchParams.get("prompt");
      const scope = searchParams.get("scope");

      if (authuser && code && prompt && scope) {
        const urlQuery = `authuser=${authuser}&code=${code}&prompt=${prompt}&scope=${scope}`;
        handleGoogleCallback(urlQuery);
      } else {
        setRes(false);
        toast.error(ServeLangItem()?.Invalid_callback_parameters || "Geçersiz geri çağrı parametreleri");
        router.push("/login");
      }
    }
  }, [res, searchParams, router, dispatch]);

  // Show loading while not on client or during processing
  if (res) {
    return (
      <div
        className="w-full h-screen bg-black bg-opacity-70 flex justify-center items-center relative"
        style={{ zIndex: 999999 }}
      >
        <LoaderStyleOne />
      </div>
    );
  }

  return null;
}

function GooglePage() {
  return (
    <Suspense
      fallback={
        <div
          className="w-full h-screen bg-black bg-opacity-70 flex justify-center items-center relative"
          style={{ zIndex: 999999 }}
        >
          <LoaderStyleOne />
        </div>
      }
    >
      <GooglePageContent />
    </Suspense>
  );
}

export default GooglePage;
