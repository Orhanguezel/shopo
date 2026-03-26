"use client";

// React and Next.js imports
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Third-party library imports
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// Local imports
import InputCom from "../../Helpers/InputCom";
import LoaderStyleOne from "../../Helpers/Loaders/LoaderStyleOne";
import ServeLangItem from "../../Helpers/ServeLangItem";
import {
  useUserForgotApiMutation,
  useUserResetApiMutation,
} from "@/redux/features/auth/apiSlice";
import appConfig from "@/appConfig";

// SVG Components for decorative shapes
const LineShape = () => (
  <svg
    width="354"
    height="30"
    viewBox="0 0 354 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
      stroke="#FCBF49"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LineShapeTwo = () => (
  <svg
    width="354"
    height="30"
    viewBox="0 0 354 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
      stroke="#FCBF49"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function ForgotPass() {
  // Router for navigation
  const router = useRouter();

  // Redux state for website setup (for login image)
  const { websiteSetup } = useSelector((state) => state.websiteSetup);

  // Component state management
  const [fields, setFields] = useState({
    email: "",
    otp: "",
    newPass: "",
    confirmPassword: "",
  });
  const [resetPass, setResetpass] = useState(false);
  const [forgotUser, setForgotUser] = useState(true);
  const [errors, setErrors] = useState(null);
  const [imgThumb, setImgThumb] = useState(null);

  // Effects
  // Set login image from website setup when component mounts or websiteSetup changes
  useEffect(() => {
    if (websiteSetup) {
      setImgThumb(websiteSetup.payload.image_content.login_image);
    }
  }, [websiteSetup]);

  // Event Handlers
  /**
   * Generic input handler for all form fields
   * Updates the fields state with the new value
   * @param {Event} e - Input change event
   */
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle forgot password request (send OTP to email)
   * @Initialization Forgot Api @const userForgotApi
   * @func forgotSuccessHandler @param data @param statusCode
   * @func forgotErrorHandler @param error
   * @func doForgot
   */
  const [userForgotApi, { isLoading: isForgotLoading }] =
    useUserForgotApiMutation();
  const forgotSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      setResetpass(true);
      setForgotUser(false);
      setErrors(null);
    } else {
      toast.error(data?.data?.notification);
    }
  };
  const forgotErrorHandler = (error) => {
    if (error?.data?.notification) toast.error(error?.data.notification);
  };
  const doForgot = async () => {
    await userForgotApi({
      email: fields.email.trim(),
      success: forgotSuccessHandler,
      error: forgotErrorHandler,
    });
  };

  /**
   * Handle password reset with OTP verification
   * @Initialization Reset Api @const userResetApi
   * @func resetSuccessHandler @param data @param statusCode
   * @func resetErrorHandler @param error
   * @func doReset
   */

  const [userResetApi, { isLoading: isResetLoading }] =
    useUserResetApiMutation();

  const resetSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      toast.success(data?.notification);
      router.push("login");
    } else {
      toast.error(data?.notification);
    }
  };

  const resetErrorHandler = (error) => {
    if (error?.data?.notification) toast.error(error?.data.notification);
  };

  const doReset = async () => {
    await userResetApi({
      otp: fields.otp,
      email: fields.email.trim(),
      password: fields.newPass,
      password_confirmation: fields.confirmPassword,
      success: resetSuccessHandler,
      error: resetErrorHandler,
    });
  };

  // Render Methods
  /**
   * Render the email input form (Step 1)
   * @returns {JSX.Element} Email form component
   */
  const renderEmailForm = () => (
    <div className="w-full">
      {/* Form Title */}
      <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
        <h1 className="text-[34px] font-bold leading-[74px] text-qblack capitalize">
          {ServeLangItem()?.Forgot_password}
        </h1>
        <div className="shape -mt-6">
          <LineShapeTwo />
        </div>
      </div>

      {/* Form Inputs */}
      <div className="input-area">
        {/* Email Input Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder={ServeLangItem()?.Email_Address}
            label={ServeLangItem()?.Email_Address + "*"}
            name="email"
            type="email"
            inputClasses="h-[50px]"
            inputHandler={handleInput}
            value={fields.email}
          />
        </div>

        {/* Submit Button */}
        <div className="signin-area mb-3.5">
          <div className="flex justify-center">
            <button
              onClick={doForgot}
              type="button"
              disabled={!fields.email || isForgotLoading}
              className="black-btn disabled:bg-opacity-50 disabled:cursor-not-allowed mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center"
            >
              <span>{ServeLangItem()?.Send}</span>
              {isForgotLoading && (
                <span className="w-5 " style={{ transform: "scale(0.3)" }}>
                  <LoaderStyleOne />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render the password reset form (Step 2)
   * @returns {JSX.Element} Password reset form component
   */
  const renderResetForm = () => (
    <div className="w-full">
      {/* Form Title */}
      <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
        <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
          {ServeLangItem()?.Reset_Password}
        </h1>
        <div className="shape -mt-6">
          <LineShape />
        </div>
      </div>

      {/* Form Inputs */}
      <div className="input-area">
        {/* OTP Input Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder="* * * * * *"
            label={ServeLangItem()?.OTP + "*"}
            name="otp"
            type="text"
            inputClasses="h-[50px]"
            value={fields.otp}
            error={errors}
            inputHandler={handleInput}
          />
        </div>

        {/* New Password Input Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder="* * * * * *"
            label={ServeLangItem()?.New_Password + "*"}
            name="newPass"
            type="password"
            inputClasses="h-[50px]"
            value={fields.newPass}
            error={
              errors?.data?.errors &&
              Object.hasOwn(errors.data.errors, "password")
            }
            inputHandler={handleInput}
          />
          {errors?.data?.errors?.password && (
            <span className="text-sm mt-1 text-qred">
              {errors.data.errors.password[0]}
            </span>
          )}
        </div>

        {/* Confirm Password Input Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder="* * * * * *"
            label={ServeLangItem()?.Confirm_Password + "*"}
            name="confirmPassword"
            type="password"
            inputClasses="h-[50px]"
            value={fields.confirmPassword}
            error={
              errors?.data?.errors &&
              Object.hasOwn(errors.data.errors, "password")
            }
            inputHandler={handleInput}
          />
          {errors?.data?.errors?.password && (
            <span className="text-sm mt-1 text-qred">
              {errors.data.errors.password[0]}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div className="signin-area mb-3.5">
          <div className="flex justify-center">
            <button
              onClick={doReset}
              type="button"
              disabled={
                !(fields.otp && fields.confirmPassword && fields.newPass) ||
                isResetLoading
              }
              className="black-btn disabled:bg-opacity-50 disabled:cursor-not-allowed mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center"
            >
              <span>{ServeLangItem()?.Reset}</span>
              {isResetLoading && (
                <span className="w-5 " style={{ transform: "scale(0.3)" }}>
                  <LoaderStyleOne />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Component Render
  return (
    <div className="login-page-wrapper w-full py-10">
      <div className="container-x mx-auto">
        <div className="lg:flex items-center relative">
          {/* Main Form Card */}
          <div className="lg:w-[572px] w-full h-[783px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
            {forgotUser
              ? renderEmailForm()
              : resetPass
              ? renderResetForm()
              : ""}
          </div>

          {/* Side Image (Desktop Only) */}
          <div className="flex-1 lg:flex hidden transform scale-60 xl:scale-100 xl:justify-center ">
            <div
              className="absolute ltr:xl:-right-20 ltr:-right-[138px] rtl:-left-20 rtl:-left-[138px]"
              style={{ top: "calc(50% - 258px)" }}
            >
              {imgThumb && (
                <Image
                  width={608}
                  height={480}
                  src={`${appConfig.BASE_URL + imgThumb}`}
                  alt="login"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
