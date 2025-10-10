// src/components/Auth/Login/index.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Partials/Layout";
import Thumbnail from "./Thumbnail";
import { toast } from "react-toastify";

import {
  useLoginWithEmailMutation,
  useLoginWithGoogleMutation,
  useMeQuery, // ⬅️ ekledik: zaten girişliyse oto-redirect
} from "@/api-manage/api-call-functions/public/publicAuth.api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const AFTER_LOGIN_DEFAULT =
  (import.meta.env.VITE_AFTER_LOGIN_PATH || "/profile#dashboard").trim(); // ⬅️ default dashboard

export default function Login() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // Girişliyse login sayfasına gereksiz kalmasın → oto-redirect
  const { data: me, isLoading: meLoading } = useMeQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const [formError, setFormError] = useState(null);

  // Google Identity Services
  const [gsiReady, setGsiReady] = useState(false);
  const gsiInitializedRef = useRef(false);

  // remember me
  useEffect(() => {
    const saved = localStorage.getItem("login_email");
    if (saved) {
      setEmail(saved);
      setChecked(true);
    }
  }, []);

  const [loginEmail,  { isLoading }]           = useLoginWithEmailMutation();
  const [loginGoogle, { isLoading: isGoogle }] = useLoginWithGoogleMutation();

  /* ---------- Redirect seçimi (güvenli) ---------- */
  const pickRedirect = useMemo(() => {
    const r = sp.get("redirect");
    const isSafe =
      r && r.startsWith("/") && !r.startsWith("//") && !r.toLowerCase().startsWith("/http");
    let target = isSafe ? r : AFTER_LOGIN_DEFAULT;
    // "/profile" geldiyse "dashboard" anchor’ına yönlendir
    if (target === "/profile" || target === "/profile/") target = "/profile#dashboard";
    return target;
  }, [sp]);

  // Eğer zaten girişliyse login sayfasında bekletme → direkt gönder
  useEffect(() => {
    const uid = me?._id || me?.id;
    if (!meLoading && uid) {
      navigate(pickRedirect, { replace: true });
    }
  }, [me, meLoading, pickRedirect, navigate]);

  /* ---------- GSI loader ---------- */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return; // env yoksa google opsiyonu gizli/disabled
    if (window.google?.accounts?.id) {
      setGsiReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setGsiReady(true);
    s.onerror = () => setFormError("Google oturum açma kitaplığı yüklenemedi.");
    document.head.appendChild(s);
    return () => {
      try { document.head.removeChild(s); } catch { /* no-op */ }
    };
  }, []);

  // GSI initialize (tek sefer)
  useEffect(() => {
    if (!gsiReady || !GOOGLE_CLIENT_ID) return;
    if (gsiInitializedRef.current) return;
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        if (!credential) {
          setFormError("Google kimlik belirteci alınamadı.");
          return;
        }
        setFormError(null);
        try {
          await loginGoogle({ idToken: credential }).unwrap();
          toast.success("Google ile giriş yapıldı.");
          navigate(pickRedirect, { replace: true }); // ⬅️ dashboard’a
        } catch (err) {
          const msg = err?.data?.message || err?.error || "Google ile giriş başarısız.";
          setFormError(msg);
          toast.error(msg);
        }
      },
      auto_select: false,
      ux_mode: "popup",
    });

    gsiInitializedRef.current = true;
  }, [gsiReady, loginGoogle, pickRedirect, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = email.trim();
    if (!trimmed || !password) {
      const msg = "Email ve şifre gerekli.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      await loginEmail({ email: trimmed, password }).unwrap();

      if (checked) localStorage.setItem("login_email", trimmed);
      else localStorage.removeItem("login_email");

      toast.success("Giriş başarılı.");
      navigate(pickRedirect, { replace: true }); // ⬅️ dashboard’a
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Giriş yapılamadı. Bilgileri kontrol edin.";
      setFormError(msg);
      toast.error(msg);
    }
  };

  const onGoogleClick = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!GOOGLE_CLIENT_ID) {
      const msg = "Google istemci anahtarı yapılandırılmamış (VITE_GOOGLE_CLIENT_ID).";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!window.google?.accounts?.id) {
      const msg = "Google oturum açma hazır değil. Sayfayı yenileyin.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    window.google.accounts.id.prompt();
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full h-[783px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                  <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
                    Log In
                  </h1>
                  <div className="shape -mt-6">
                    <svg width="172" height="29" viewBox="0 0 172 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5.08742C17.6667 19.0972 30.5 31.1305 62.5 27.2693C110.617 21.4634 150 -10.09 171 5.08727" stroke="#FFBB38" />
                    </svg>
                  </div>
                </div>

                {formError && (
                  <div className="text-red-600 text-sm mb-4 break-words">
                    {String(formError)}
                  </div>
                )}

                <form className="input-area" onSubmit={onSubmit}>
                  {/* Email */}
                  <div className="input-item mb-5">
                    <label className="block text-sm font-500 text-qblack mb-2">
                      Email Address*
                    </label>
                    <input
                      className="h-[50px] w-full border border-qgray-border px-4 text-sm focus:outline-none"
                      placeholder="example@domain.com"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="input-item mb-5">
                    <label className="block text-sm font-500 text-qblack mb-2">
                      Password*
                    </label>
                    <input
                      className="h-[50px] w-full border border-qgray-border px-4 text-sm focus:outline-none"
                      placeholder="● ● ● ● ● ●"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="forgot-password-area flex justify-between items-center mb-7">
                    <div className="remember-checkbox flex items-center space-x-2.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setChecked((v) => !v);
                        }}
                        type="button"
                        className="w-5 h-5 text-qblack flex justify-center items-center border border-light-gray"
                        aria-pressed={checked}
                      >
                        {checked && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <span
                        onClick={() => setChecked((v) => !v)}
                        className="text-base text-black cursor-pointer"
                      >
                        Remember Me
                      </span>
                    </div>
                    <Link to="/forgot-password" className="text-base text-qyellow">
                      Forgot Password
                    </Link>
                  </div>

                  <div className="signin-area mb-3.5">
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="black-btn mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center disabled:opacity-60"
                      >
                        <span>{isLoading ? "Logging in..." : "Log In"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onGoogleClick}
                      disabled={isGoogle || !GOOGLE_CLIENT_ID || !gsiReady}
                      className="w-full border border-qgray-border h-[50px] flex space-x-3 justify-center bg-[#FAFAFA] items-center disabled:opacity-60"
                      title={!GOOGLE_CLIENT_ID ? "VITE_GOOGLE_CLIENT_ID eksik" : undefined}
                    >
                      <span className="text-[18px] text-qgraytwo font-normal">
                        {isGoogle ? "Connecting..." : "Sign In with Google"}
                      </span>
                    </button>
                  </div>

                  <div className="signup-area flex justify-center">
                    <p className="text-base text-qgraytwo font-normal">
                      Don’t have an account?
                      <Link to="/signup" className="ml-2 text-qblack">
                        Sign up free
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex-1 lg:flex hidden transform scale-60 xl:scale-100 xl:justify-center">
              <div className="absolute xl:-right-20 -right-[138px]" style={{ top: "calc(50% - 258px)" }}>
                <Thumbnail />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
