import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Partials/Layout";
import Thumbnail from "./Thumbnail";
import InputCom from "@/components/Helpers/InputCom";
import { toast } from "react-toastify";

// RTK Query hook
import { useRegisterWithEmailMutation } from "@/api-manage/api-call-functions/public/publicAuth.api";

const AFTER_SIGNUP_DEFAULT =
  (import.meta.env.VITE_AFTER_LOGIN_PATH || "/profile#dashboard").trim();

export default function Signup() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // form state
  const [firstName, setFirst] = useState("");
  const [lastName, setLast]   = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");

  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("");
  const [zip, setZip]         = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [agree, setAgree]       = useState(false);

  const [formError, setFormError] = useState(null);
  const [registerWithEmail, { isLoading }] = useRegisterWithEmailMutation();

  // güvenli redirect
  const pickRedirect = useMemo(() => {
    const r = sp.get("redirect");
    const isSafe =
      r && r.startsWith("/") && !r.startsWith("//") && !r.toLowerCase().startsWith("/http");
    let target = isSafe ? r : AFTER_SIGNUP_DEFAULT;
    if (target === "/profile" || target === "/profile/") target = "/profile#dashboard";
    return target;
  }, [sp]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const name = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
    const cleanEmail = email.trim();

    if (!name || !cleanEmail || !password) {
      const msg = "İsim, e-posta ve şifre zorunludur.";
      setFormError(msg); toast.error(msg); return;
    }
    if (password.length < 8) {
      const msg = "Şifre en az 8 karakter olmalı.";
      setFormError(msg); toast.error(msg); return;
    }
    if (password !== confirm) {
      const msg = "Şifre ve doğrulama aynı olmalı.";
      setFormError(msg); toast.error(msg); return;
    }
    if (!country || !city.trim() || !address.trim() || !zip.trim()) {
      const msg = "Adres bilgilerini eksiksiz girin.";
      setFormError(msg); toast.error(msg); return;
    }
    if (!agree) {
      const msg = "Şartları kabul etmelisiniz.";
      setFormError(msg); toast.error(msg); return;
    }

    // 🔑 Yeni backend payload: phone + address
    const payload = {
      email: cleanEmail,
      password,
      name,
      phone: phone?.trim() || undefined,
      address: {
        line1: address.trim(),
        city: city.trim(),
        zip: zip.trim(),
        country, // select’ten gelen değer
      },
    };

    try {
      await toast.promise(registerWithEmail(payload).unwrap(), {
        pending: "Hesap oluşturuluyor...",
        success: "Hesap oluşturuldu, giriş yapıldı.",
        error: {
          render({ data }) {
            return data?.data?.message || data?.error || "Kayıt başarısız.";
          },
        },
      });
      navigate(pickRedirect, { replace: true });
    } catch (err) {
      const msg = err?.data?.message || err?.error || "Kayıt başarısız.";
      setFormError(msg);
      // toast.promise üstte error’ü gösteriyor; yine de fallback:
      toast.error(msg);
    }
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full lg:h-[783px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                  <h1 className="text-[34px] font-bold leading-[74px] text-qblack">Create Account</h1>
                  <div className="shape -mt-6">
                    <svg width="354" height="30" viewBox="0 0 354 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 28.8C17.65 20.36 63.95 8.17 113.5 17.88C166.73 28.31 341.33 42.7 353 1" stroke="#FFBB38" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {formError && (
                  <div className="text-red-600 text-sm mb-4 break-words">{String(formError)}</div>
                )}

                {/* FORM */}
                <form className="input-area" onSubmit={onSubmit}>
                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <InputCom placeholder="Orhan" label="First Name*" name="fname" type="text"
                      inputClasses="h-[50px]" value={firstName} onChange={(e)=>setFirst(e.target.value)} />
                    <InputCom placeholder="Güzel" label="Last Name*" name="lname" type="text"
                      inputClasses="h-[50px]" value={lastName} onChange={(e)=>setLast(e.target.value)} />
                  </div>

                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <InputCom placeholder="demo@mail.com" label="Email Address*" name="email" type="email"
                      inputClasses="h-[50px]" value={email} onChange={(e)=>setEmail(e.target.value)} />
                    <InputCom placeholder="05xx xxx xx xx" label="Phone" name="phone" type="text"
                      inputClasses="h-[50px]" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                  </div>

                  {/* PASSWORDS */}
                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <InputCom placeholder="● ● ● ● ● ● ● ●" label="Password*" name="password" type="password"
                      inputClasses="h-[50px]" value={password} onChange={(e)=>setPassword(e.target.value)} />
                    <InputCom placeholder="● ● ● ● ● ● ● ●" label="Confirm Password*" name="confirm" type="password"
                      inputClasses="h-[50px]" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
                  </div>

                  {/* COUNTRY */}
                  <div className="input-item mb-5">
                    <label className="input-label text-qgray capitalize text-[13px] font-normal block mb-2">Country*</label>
                    <select
                      className="w-full h-[50px] border border-[#EDEDED] px-5 text-[13px] text-qgraytwo outline-none"
                      value={country}
                      onChange={(e)=>setCountry(e.target.value)}
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="TR">Türkiye</option>
                      <option value="DE">Germany</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>

                  {/* ADDRESS */}
                  <div className="input-item mb-5">
                    <InputCom placeholder="Street, number, etc." label="Address*" name="address" type="text"
                      inputClasses="h-[50px]" value={address} onChange={(e)=>setAddress(e.target.value)} />
                  </div>

                  <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 mb-5">
                    <div className="w-1/2">
                      <InputCom
                        placeholder="Town / City"
                        label="Town / City*"
                        name="city"
                        type="text"
                        inputClasses="h-[50px]"
                        value={city}
                        onChange={(e)=>setCity(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-[50px] mb-5 sm:mb-0">
                        <InputCom
                          label="Postcode / ZIP*"
                          inputClasses="w-full h-full"
                          type="text"
                          placeholder="00000"
                          value={zip}
                          onChange={(e)=>setZip(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* TERMS */}
                  <div className="forgot-password-area mb-7">
                    <div className="remember-checkbox flex items-center space-x-2.5">
                      <button
                        onClick={(e)=>{e.preventDefault(); setAgree(v=>!v);}}
                        type="button"
                        className="w-5 h-5 text-qblack flex justify-center items-center border border-light-gray"
                        aria-pressed={agree}
                      >
                        {agree && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                      <span onClick={()=>setAgree(v=>!v)} className="text-base text-black cursor-pointer">
                        I agree all <span className="text-qblack">terms and conditions</span> in BigShop.
                      </span>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <div className="signin-area mb-3">
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isLoading || !agree}
                        className="black-btn text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center disabled:opacity-60"
                      >
                        <span>{isLoading ? "Creating..." : "Create Account"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="signup-area flex justify-center">
                    <p className="text-base text-qgraytwo font-normal">
                      Already have an Account?
                      <Link to="/login" className="ml-2 text-qblack">Log In</Link>
                    </p>
                  </div>
                </form>
                {/* /FORM */}
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
