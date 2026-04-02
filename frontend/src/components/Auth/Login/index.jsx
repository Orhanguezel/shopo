"use client";
import LoginLayout from "./LoginLayout";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginWidget from "./LoginWidget";
import auth from "@/utils/auth";

const IMAGE_FALLBACK = "/assets/images/server-error.png";

function Login({ isLayout = true }) {
  const router = useRouter();
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const [imgThumb, setImgThumb] = useState(null);

  // Zaten giriş yapılmışsa login formunu gösterme
  useEffect(() => {
    if (auth()) {
      router.replace("/profile#dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (websiteSetup) {
      setImgThumb(
        websiteSetup.payload?.image_content?.login_image || IMAGE_FALLBACK
      );
    }
  }, [websiteSetup]);
  if (isLayout) {
    return (
      <LoginLayout imgThumb={imgThumb}>
        <LoginWidget />
      </LoginLayout>
    );
  } else {
    return <LoginLayout />;
  }
}

export default Login;
