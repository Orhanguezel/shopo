// React and Next.js imports
import React, { useContext, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Third-party library imports
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCookie, deleteCookie } from "cookies-next";

// Component imports
import InputCom from "../../Helpers/InputCom";
import LoaderStyleOne from "../../Helpers/Loaders/LoaderStyleOne";
import ServeLangItem from "../../Helpers/ServeLangItem";
import LoginContext from "../../Contexts/LoginContext";

// Icon imports
import GoogleLoginUrlIcon from "@/components/Helpers/icons/GoogleLoginUrlIcon";
import FacebookLoginUrlIcon from "@/components/Helpers/icons/FacebookLoginUrlIcon";

// Redux action imports
import { setWishlistData } from "../../../redux/features/wishlist/wishlistSlice";
import {
  useFacebookGetLoginUrlApiQuery,
  useGoogleGetLoginUrlApiQuery,
} from "@/redux/features/socialLogin/apiSlice";
import {
  useResendRegisterCodeApiMutation,
  useUserLoginApiMutation,
} from "@/redux/features/auth/apiSlice";
import { useLazyGetWishlistItemsApiQuery } from "@/redux/features/product/apiSlice";
import auth from "@/utils/auth";

// login line shapre
const LoginShape = () => {
  return (
    <svg
      width="172"
      height="29"
      viewBox="0 0 172 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5.08742C17.6667 19.0972 30.5 31.1305 62.5 27.2693C110.617 21.4634 150 -10.09 171 5.08727"
        stroke="#FCBF49"
      />
    </svg>
  );
};

// checked svg
const CheckedSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
};

/**
 * SEND Component - Displays OTP verification message with resend option
 * @param {Function} action - Function to handle OTP resend
 * @returns {JSX.Element} OTP verification UI
 */
const SEND = ({ action }) => {
  return (
    <div>
      <p className="text-xs text-qblack">
        Please verify your acount. If you didnt get OTP, please resend your OTP
        and verify
      </p>
      <button
        type="button"
        onClick={action}
        className="text-sm text-blue-500 font-bold mt-2"
      >
        Send OTP
      </button>
    </div>
  );
};

/**
 * LoginWidget Component - Main login form component
 * @param {boolean} redirect - Whether to redirect after login (default: true)
 * @param {Function} loginActionPopup - Function to handle login popup action
 * @param {Function} notVerifyHandler - Function to handle unverified account
 * @returns {JSX.Element} Login form UI
 */
function LoginWidget({ redirect = true, loginActionPopup, notVerifyHandler }) {
  // Router and Redux hooks
  const router = useRouter();
  const dispatch = useDispatch();

  // Context hooks
  const loginPopupBoard = useContext(LoginContext);

  // Form state management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state management
  const [checked, setValue] = useState(false);

  /**
   * Handles input field changes for form data
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Toggles remember me checkbox state
   */
  const rememberMe = () => {
    setValue(!checked);
  };

  /**
   * get wishlist items api
   * @Initializaing useLazyGetWishlistItemsApiQuery @const getWishlistItemsApi
   * @func getWishlistItemsSuccessHandler @params data, error
   * @func getWishlistItems @params data
   */
  const [getWishlistItemsApi, { isLoading: isGetWishlistItemsLoading }] =
    useLazyGetWishlistItemsApiQuery();

  const getWishlistItemsSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      dispatch(setWishlistData(data));
    }
  };

  const getWishlistItems = async () => {
    const userToken = auth()?.access_token;
    const data = {
      token: userToken,
      success: getWishlistItemsSuccessHandler,
    };
    await getWishlistItemsApi(data);
  };
  /**
   * @Initialization Resend Register Code Api @const resendRegisterCodeApi
   * @func successOtpHandler @param statusCode
   * @func sendOtpHandler
   */

  const [resendRegisterCodeApi, { isLoading: isResendLoading }] =
    useResendRegisterCodeApiMutation();

  const successOtpHandler = (statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      // Clear the OTP notification toast
      toast.dismiss();
      // Store email before clearing form data
      const emailForRedirect = formData.email;
      // Clear form data when OTP is successfully sent
      setFormData({ email: "", password: "" });
      router.push(`/verify-you?email=${emailForRedirect}`);
    } else {
      toast.error(ServeLangItem()?.OTP_sending_failed || "OTP gönderimi başarısız");
    }
  };

  const sendOtpHandler = async (data) => {
    await resendRegisterCodeApi({
      email: formData.email,
      success: successOtpHandler,
    });
  };

  /**
   * Handles user login functionality
   * @Initialization Login Api @const userLoginApi
   * @func loginSuccessHandler @param data
   * @func loginErrorHandler @param error
   * @func doLogin
   */
  const [userLoginApi, { isLoading: isLoginLoading }] =
    useUserLoginApiMutation();

  const loginSuccessHandler = async (data) => {
    // TODO: Implement login success handler
    toast.success(data?.notification || ServeLangItem()?.Login_Successfully || "Başarıyla Giriş Yapıldı");
    setFormData({ email: "", password: "" });
    localStorage.removeItem("auth");
    localStorage.setItem("auth", JSON.stringify(data));
    // Remove existing access_token cookie if present
    deleteCookie("access_token");
    // Set new access_token with proper options for server-side access
    setCookie("access_token", data?.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    await getWishlistItems();
    if (redirect) {
      router.push("/");
    } else {
      if (data) {
        loginPopupBoard.handlerPopup(false);
      }
    }
  };

  const loginErrorHandler = (error) => {
    // TODO: Implement login error handler
    if (
      error?.data?.notification ===
      "Please verify your acount. If you didn't get OTP, please resend your OTP and verify"
    ) {
      toast.warn(<SEND action={sendOtpHandler} />, {
        autoClose: false,
        icon: false,
        theme: "colored",
      });
      if (notVerifyHandler) {
        notVerifyHandler();
      }
    } else {
      toast.error(ServeLangItem()?.Invalid_Credentials);
    }
  };

  const doLogin = async () => {
    await userLoginApi({
      email: formData.email,
      password: formData.password,
      success: loginSuccessHandler,
      error: loginErrorHandler,
    });
  };

  /**
   * Fetches social login URLs
   * @param {string} facebookGetLoginUrl - Facebook login URL
   * @param {string} googleGetLoginUrl - Google login URL
   */
  const { data: facebookGetLoginUrl } = useFacebookGetLoginUrlApiQuery();
  const { data: googleGetLoginUrl } = useGoogleGetLoginUrlApiQuery();

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
        <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
          {ServeLangItem()?.Log_In}
        </h1>
        <div className="shape -mt-6">
          <LoginShape />
        </div>
      </div>

      {/* Form Section */}
      <div className="input-area">
        {/* Email Input Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder={ServeLangItem()?.Email_or_Phone + " (+Country Code)"}
            label={ServeLangItem()?.Email_or_Phone + "*"}
            name="email"
            type="text"
            inputClasses="h-[50px]"
            inputHandler={handleInputChange}
            value={formData.email}
          />
        </div>

        {/* Password Input Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder="* * * * * *"
            label={ServeLangItem()?.Password + "*"}
            name="password"
            type="password"
            inputClasses="h-[50px]"
            inputHandler={handleInputChange}
            value={formData.password}
          />
        </div>

        {/* Remember Me and Forgot Password Section */}
        <div className="forgot-password-area flex justify-between items-center mb-7">
          {/* Remember Me Checkbox */}
          <div className="remember-checkbox flex items-center space-x-2.5 rtl:space-x-reverse cursor-pointer select-none">
            <button
              onClick={rememberMe}
              type="button"
              className="w-5 h-5 text-qblack flex justify-center items-center border border-light-gray cursor-pointer"
            >
              {checked && <CheckedSvg />}
            </button>
            <span onClick={rememberMe} className="text-base text-black">
              {ServeLangItem()?.Remember_Me}
            </span>
          </div>

          {/* Forgot Password Link */}
          <Link href="/forgot-password">
            <span className="text-base text-qyellow cursor-pointer">
              {ServeLangItem()?.Forgot_password}?
            </span>
          </Link>
        </div>

        {/* Login Button Section */}
        <div className="signin-area mb-3.5">
          <div className="flex justify-center">
            <button
              onClick={doLogin}
              type="button"
              disabled={isLoginLoading}
              className="black-btn mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center"
            >
              <span>{ServeLangItem()?.Login}</span>
              {isLoginLoading && (
                <span className="w-5 " style={{ transform: "scale(0.3)" }}>
                  <LoaderStyleOne />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Social Login Section */}
        {/* Google Login Button */}
        <a
          href={`${googleGetLoginUrl?.url || "#"}`}
          className="w-full border border-qgray-border h-[50px] flex space-x-3  justify-center bg-[#FAFAFA] items-center mb-2"
        >
          <GoogleLoginUrlIcon />
          <span className="text-[18px] text-qgraytwo font-normal">
            Sign In with Google
          </span>
        </a>

        {/* Facebook Login Button */}
        <a
          href={`${facebookGetLoginUrl?.url || "#"}`}
          className="w-full border border-qgray-border text-white h-[50px] flex space-x-3  justify-center bg-[#38599A] items-center mb-2"
        >
          <FacebookLoginUrlIcon />
          <span className="text-[18px] font-normal text-white">
            Sign In with Facebook
          </span>
        </a>

        {/* Sign Up Section */}
        <div className="signup-area flex justify-center">
          <p className="text-base text-qgraytwo font-normal">
            {ServeLangItem()?.Dontt_have_an_account} ?
            {redirect ? (
              <Link href="/signup">
                <span className="ml-2 text-qblack cursor-pointer capitalize">
                  {ServeLangItem()?.sign_up_free}
                </span>
              </Link>
            ) : (
              <button onClick={loginActionPopup} type="button">
                <span className="ml-2 text-qblack cursor-pointer capitalize">
                  {ServeLangItem()?.sign_up_free}
                </span>
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginWidget;
