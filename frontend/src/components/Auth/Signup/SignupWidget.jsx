"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

// Local imports
import ServeLangItem from "../../Helpers/ServeLangItem";
import InputCom from "../../Helpers/InputCom";
import LoaderStyleOne from "../../Helpers/Loaders/LoaderStyleOne";
import GoogleLoginUrlIcon from "@/components/Helpers/icons/GoogleLoginUrlIcon";
import FacebookLoginUrlIcon from "@/components/Helpers/icons/FacebookLoginUrlIcon";

// Utilities and data
import settings from "../../../utils/settings";
import countries from "../../../data/CountryCodes.json";
import { useUserSignupApiMutation, useSendOtpApiMutation } from "@/redux/features/auth/apiSlice";
import {
  useFacebookGetLoginUrlApiQuery,
  useGoogleGetLoginUrlApiQuery,
} from "@/redux/features/socialLogin/apiSlice";
import OtpVerifyStep from "./OtpVerifyStep";

/**
 * Signup shape SVG component for the title decoration
 */
const SignupShape = () => {
  return (
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
};

/**
 * Checked checkbox SVG component
 */
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
 * SignupWidget Component
 * Handles user registration with form validation and social login options
 *
 * @param {boolean} redirect - Whether to redirect after successful signup
 * @param {function} signupActionPopup - Function to handle popup signup action
 * @param {function} changeContent - Function to change content after signup
 */
function SignupWidget({ redirect = true, signupActionPopup, changeContent }) {
  const router = useRouter();

  // Form data state - consolidated all input fields
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "+880",
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [checked, setCheck] = useState(false);
  const [errors, setErrors] = useState(null);
  const [currentStep, setCurrentStep] = useState("form"); // steps: 'form', 'otp', 'success'
  const [otpToken, setOtpToken] = useState("");

  /**
   * Handles input field changes
   * @param {string} field - Field name to update
   * @param {string} value - New value for the field
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Toggles the terms and conditions checkbox
   */
  const rememberMe = () => {
    setCheck(!checked);
  };

  // Country selection state
  const [getCountries, setGetCountries] = useState(null);
  const [countryDropToggle, setCountryDropToggle] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("BD");

  /**
   * Initialize countries data on component mount
   */
  useEffect(() => {
    if (!getCountries) {
      setGetCountries(countries && countries.countries);
    }
  }, [getCountries]);

  /**
   * Set default phone code based on settings
   */
  const { phone_number_required, default_phone_code } = settings();
  useEffect(() => {
    if (default_phone_code) {
      let defaultCountry =
        getCountries &&
        getCountries.length > 0 &&
        getCountries.find((item) => item.code === default_phone_code);
      if (defaultCountry) {
        handleInputChange("phone", defaultCountry.dial_code);
        setSelectedCountry(defaultCountry.code);
      }
    }
  }, [default_phone_code, getCountries]);

  /**
   * Handles country selection from dropdown
   * @param {object} value - Country object with code and dial_code
   */
  const selectCountryhandler = (value) => {
    setSelectedCountry(value.code);
    handleInputChange("phone", value.dial_code);
    setCountryDropToggle(false);
  };

  /**
   * Handles user Signup functionality
   * @Initialization Signup Api @const userSignupApi
   * @func signupSuccessHandler @param data @param statusCode
   * @func signupErrorHandler @param error
   * @func doSignup
   */
  const [userSignupApi, { isLoading: isSignupLoading }] =
    useUserSignupApiMutation();
  const [sendOtpApi, { isLoading: isOtpSending }] = useSendOtpApiMutation();

  const signupSuccessHandler = (data, statusCode) => {
    if (statusCode === 200) {
      toast.success(data.notification);
      if (redirect) {
        router.push(`/verify-you?email=${formData.email}`);
      } else {
        if (changeContent) {
          changeContent();
        } else {
          router.push("/login");
        }
      }
      setFormData({
        fname: "",
        lname: "",
        email: "",
        phone: "+880",
        password: "",
        confirmPassword: "",
      });
      setCheck(false);
    } else {
      toast.error(data.message);
    }
  };

  const signupErrorHandler = (error) => {
    if (error.status === 403) {
      toast.error(error.data.message);
    }
    setErrors(error && error.data.errors);
  };
  /**
   * Triggers the OTP sending process
   */
  const handleSendOtpAndNext = async () => {
    // Basic frontend validation before sending OTP
    if (!formData.fname || !formData.lname || !formData.email || !formData.password) {
      toast.error(ServeLangItem()?.Please_fill_all_required_fields || "Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(ServeLangItem()?.Confirm_password_does_not_match || "Şifreler uyuşmuyor");
      return;
    }
    if (!formData.phone) {
      toast.error(ServeLangItem()?.Phone_number_is_required || "Telefon numarası zorunludur");
      return;
    }

    try {
      const result = await sendOtpApi({
        phone: formData.phone,
        purpose: "register"
      }).unwrap();

      if (result.success) {
        toast.success(result.message);
        setCurrentStep("otp");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error?.data?.message || "OTP gönderilirken hata oluştu");
    }
  };

  /**
   * Final registration after OTP verified
   * @param {string} token - The OTP verified token returned from OtpVerifyStep
   */
  const onOtpVerified = async (token) => {
    setOtpToken(token);
    // Proceed directly to final signup
    await doSignup(token);
  };

  const doSignup = async (token) => {
    if (checked) {
      await userSignupApi({
        name: formData.fname + " " + formData.lname,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        phone: formData.phone ? formData.phone : "",
        otp_verified_token: token || otpToken,
        agree: checked ? 1 : "",
        success: signupSuccessHandler,
        error: signupErrorHandler,
      });
    } else {
      toast.error(ServeLangItem()?.Please_accept_terms_and_conditions || "Lütfen şartlar ve koşulları kabul edin");
    }
  };

  /**
   * Fetches social login URLs
   * @param {string} facebookGetLoginUrl - Facebook login URL
   * @param {string} googleGetLoginUrl - Google login URL
   */
  const { data: facebookGetLoginUrl } = useFacebookGetLoginUrlApiQuery();
  const { data: googleGetLoginUrl } = useGoogleGetLoginUrlApiQuery();

  if (currentStep === "otp") {
    return (
      <div className="w-full">
        <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
          <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
            {ServeLangItem()?.Verify_OTP || "Doğrula"}
          </h1>
          <div className="shape -mt-6">
            <SignupShape />
          </div>
        </div>
        <div className="bg-[#FAFAFA] border border-qgray-border p-6 rounded-lg">
          <OtpVerifyStep
            phone={formData.phone}
            onVerified={onOtpVerified}
            onCancel={() => setCurrentStep("form")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ===========================================
          HEADER SECTION
          =========================================== */}
      <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
        <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
          {ServeLangItem()?.Create_Account}
        </h1>
        <div className="shape -mt-6">
          <SignupShape />
        </div>
      </div>

      {/* ===========================================
          FORM SECTION
          =========================================== */}
      <div className="input-area">
        {/* Name Fields */}
        <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 rtl:space-x-reverse mb-5 w-full">
          {/* First Name */}
          <div className="sm:w-1/2 w-full h-full">
            <InputCom
              placeholder={ServeLangItem()?.Name}
              label={ServeLangItem()?.First_Name + "*"}
              name="fname"
              type="text"
              inputClasses="h-[50px]"
              value={formData.fname}
              inputHandler={(e) => handleInputChange("fname", e.target.value)}
              error={!!(errors && Object.hasOwn(errors, "name"))}
            />
            {errors && Object.hasOwn(errors, "name") ? (
              <span className="text-sm mt-1 text-qred">{errors.name[0]}</span>
            ) : (
              ""
            )}
          </div>

          {/* Last Name */}
          <div className="sm:w-1/2 w-full h-full">
            <InputCom
              placeholder={ServeLangItem()?.Name}
              label={ServeLangItem()?.Last_Name + "*"}
              name="lname"
              type="text"
              inputClasses="h-[50px]"
              value={formData.lname}
              error={!!(errors && Object.hasOwn(errors, "name"))}
              inputHandler={(e) => handleInputChange("lname", e.target.value)}
            />
            {errors && Object.hasOwn(errors, "name") ? (
              <span className="text-sm mt-1 text-qred">{errors.name[0]}</span>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="input-item mb-5">
          <InputCom
            placeholder={ServeLangItem()?.Email}
            label={ServeLangItem()?.Email_Address + "*"}
            name="email"
            type="email"
            inputClasses="h-[50px]"
            value={formData.email}
            error={!!(errors && Object.hasOwn(errors, "email"))}
            inputHandler={(e) => handleInputChange("email", e.target.value)}
          />
          {errors && Object.hasOwn(errors, "email") ? (
            <span className="text-sm mt-1 text-qred">{errors.email[0]}</span>
          ) : (
            ""
          )}
        </div>

        {/* Phone Field - Conditional based on settings */}
        {Number(phone_number_required) === 1 && (
          <div className="input-item mb-5 relative">
            <InputCom
              placeholder={ServeLangItem()?.Phone_Number}
              label={ServeLangItem()?.phone + "*"}
              name="phone"
              type="text"
              inputClasses="h-[50px] placeholder:capitalize pl-20"
              value={formData.phone}
              error={!!(errors && Object.hasOwn(errors, "phone"))}
              inputHandler={(e) => handleInputChange("phone", e.target.value)}
            />
            {errors && Object.hasOwn(errors, "phone") ? (
              <span className="text-sm mt-1 text-qred">{errors.phone[0]}</span>
            ) : (
              ""
            )}

            {/* Country Code Selector */}
            <button
              onClick={() => setCountryDropToggle(!countryDropToggle)}
              type="button"
              className="w-[70px] h-[50px] bg-qgray-border absolute left-0 top-[29px] flex justify-center items-center"
            >
              <div className="flex items-center">
                <span>
                  <Image
                    width="30"
                    height="20"
                    src={`/assets/images/countries/${selectedCountry}.svg`}
                    alt="country"
                  />
                </span>
                <span className="text-qgray">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 14l-4-4h8z" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Country Dropdown */}
            <div
              style={{
                boxShadow: "rgb(0 0 0 / 14%) 0px 15px 50px 0px",
                display: countryDropToggle ? "block" : "none",
              }}
              className="country-dropdown-list w-[250px] h-[250px] bg-white absolute left-0 top-[80px] z-20 overflow-y-scroll"
            >
              <ul>
                {getCountries &&
                  getCountries.length > 0 &&
                  getCountries.map((item, i) => (
                    <li
                      onClick={() => selectCountryhandler(item)}
                      key={i}
                      className="flex space-x-1.5 items-center px-3 py-1 cursor-pointer"
                    >
                      <span className="w-[25px]">
                        <Image
                          width="25"
                          height="15"
                          src={`/assets/images/countries/${item.code}.svg`}
                          alt="country"
                        />
                      </span>
                      <span className="text-sm text-qgray capitalize flex-1">
                        {item.name}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Password Fields */}
        <div className="flex sm:flex-row flex-col space-y-5 sm:space-y-0 sm:space-x-5 rtl:space-x-reverse mb-5 w-full">
          {/* Password */}
          <div className="sm:w-1/2 w-full h-full">
            <InputCom
              placeholder="* * * * * *"
              label={ServeLangItem()?.Password + "*"}
              name="password"
              type="password"
              inputClasses="h-[50px]"
              value={formData.password}
              inputHandler={(e) =>
                handleInputChange("password", e.target.value)
              }
              error={!!(errors && Object.hasOwn(errors, "password"))}
            />
            {errors && Object.hasOwn(errors, "password") ? (
              <span className="text-sm mt-1 text-qred">
                {errors.password[0]}
              </span>
            ) : (
              ""
            )}
          </div>

          {/* Confirm Password */}
          <div className="sm:w-1/2 w-full h-full">
            <InputCom
              placeholder="* * * * * *"
              label={ServeLangItem()?.Confirm_Password + "*"}
              name="confirm_password"
              type="password"
              inputClasses="h-[50px]"
              value={formData.confirmPassword}
              inputHandler={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              error={!!(errors && Object.hasOwn(errors, "password"))}
            />
            {errors && Object.hasOwn(errors, "password") ? (
              <span className="text-sm mt-1 text-qred">
                {errors.password[0]}
              </span>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* ===========================================
            TERMS AND CONDITIONS SECTION
            =========================================== */}
        <div className="forgot-password-area mb-7">
          <div className="remember-checkbox flex items-center space-x-2.5 rtl:space-x-reverse">
            <button
              onClick={rememberMe}
              type="button"
              className="w-5 h-5 text-qblack flex justify-center items-center border border-light-gray"
            >
              {checked && <CheckedSvg />}
            </button>
            {redirect ? (
              <Link href="/seller-terms-condition">
                <span className="text-base text-black cursor-pointer">
                  {ServeLangItem()?.I_agree_all_terms_and_condition_in_ecoShop}
                </span>
              </Link>
            ) : (
              <button type="button">
                <span className="text-base text-black cursor-pointer">
                  {ServeLangItem()?.I_agree_all_terms_and_condition_in_ecoShop}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ===========================================
            SIGNUP BUTTON SECTION
            =========================================== */}
        <div className="signin-area mb-5">
          <div className="flex justify-center">
            {Number(phone_number_required) === 1 ? (
              <button
                onClick={handleSendOtpAndNext}
                type="button"
                disabled={!checked || isOtpSending}
                className="black-btn disabled:bg-opacity-50 disabled:cursor-not-allowed  w-full h-[50px] font-semibold flex justify-center bg-purple items-center"
              >
                <span className="text-sm text-white block">
                  {ServeLangItem()?.Get_OTP || "Doğrulama Kodu Al"}
                </span>
                {isOtpSending && (
                  <span className="ml-2 w-5 scale-50">
                    <LoaderStyleOne />
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={doSignup}
                type="button"
                disabled={!checked || isSignupLoading}
                className="black-btn disabled:bg-opacity-50 disabled:cursor-not-allowed  w-full h-[50px] font-semibold flex justify-center bg-purple items-center"
              >
                <span className="text-sm text-white block">
                  {ServeLangItem()?.Create_Account}
                </span>
                {isSignupLoading && (
                  <span className="ml-2 w-5 scale-50">
                    <LoaderStyleOne />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ===========================================
            SOCIAL LOGIN SECTION
            =========================================== */}

        {/* Google Login */}
        <a
          href={`${googleGetLoginUrl?.url || "#"}`}
          className="w-full border border-qgray-border h-[50px] flex space-x-3  justify-center bg-[#FAFAFA] items-center mb-2"
        >
          <GoogleLoginUrlIcon />
          <span className="text-[18px] text-qgraytwo font-normal">
            Sign Up with Google
          </span>
        </a>

        {/* Facebook Login */}
        <a
          href={`${facebookGetLoginUrl?.url || "#"}`}
          className="w-full border border-qgray-border text-white h-[50px] flex space-x-3  justify-center bg-[#38599A] items-center mb-2"
        >
          <FacebookLoginUrlIcon />
          <span className="text-[18px] font-normal text-white">
            Sign Up with Facebook
          </span>
        </a>

        {/* ===========================================
            LOGIN LINK SECTION
            =========================================== */}
        <div className="signup-area flex justify-center">
          <p className="text-base text-qgraytwo font-normal">
            {ServeLangItem()?.Already_have_an_Account}?
            {redirect ? (
              <Link href="/login">
                <span className=" text-qblack cursor-pointer ml-1">
                  {ServeLangItem()?.Log_In}
                </span>
              </Link>
            ) : (
              <button onClick={signupActionPopup} type="button">
                <span className=" text-qblack cursor-pointer ml-1">
                  {ServeLangItem()?.Log_In}
                </span>
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupWidget;
