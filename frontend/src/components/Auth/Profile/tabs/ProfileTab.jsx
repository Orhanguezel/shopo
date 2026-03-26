"use client";

// External imports
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import auth from "./../../../../utils/auth";
import InputCom from "../../../Helpers/InputCom";
import Selectbox from "../../../Helpers/Selectbox";
import { toast } from "react-toastify";
import ServeLangItem from "../../../Helpers/ServeLangItem";
import countries from "../../../../data/CountryCodes.json";
import settings from "./../../../../utils/settings";
import InfoQuestion from "@/components/Helpers/icons/InfoQuestion";
import EditPen from "@/components/Helpers/icons/EditPen";
import {
  useLazyGetCityListApiQuery,
  useLazyGetStateListApiQuery,
} from "@/redux/features/locations/apiSlice";
import { useUpdateProfileApiMutation } from "@/redux/features/auth/apiSlice";
import { useRouter } from "next/navigation";
import appConfig from "@/appConfig";

// arrow down svg
const ArrowDownIco = () => {
  return (
    <svg
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
        fill="#222222"
      />
    </svg>
  );
};
// Main ProfileTab component
export default function ProfileTab({ profileInfo }) {
  const router = useRouter();
  // ----------------------
  // State Management
  // ----------------------

  // Form fields state (all input fields in one object)
  const [formData, setFormData] = useState({
    name: profileInfo.personInfo.name,
    email: profileInfo.personInfo.email,
    phone: null,
    country: null,
    state: null,
    city: null,
    address: profileInfo.personInfo.address,
  });

  // Dropdown data states
  const [countryDropdown, setCountryDropdown] = useState(null);
  const [stateDropdown, setStateDropdown] = useState(null);
  const [cityDropdown, setCityDropdown] = useState(null);

  // Other UI and data states
  const [errors, setErrors] = useState(null);
  const [formImg, setFormImag] = useState(null);
  const [getCountries, setGetCountries] = useState(null);
  const [countryDropToggle, setCountryDropToggle] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("BD");
  const [profileImg, setprofileImg] = useState(
    profileInfo?.personInfo?.viewImage ? profileInfo.personInfo.viewImage : null
  );
  const [getImg] = useState(
    profileInfo?.personInfo?.image
      ? profileInfo.personInfo.image
      : profileInfo.defaultProfile.image
  );

  // Ref for file input
  const profileImgInput = useRef(null);

  // ----------------------
  // Effects
  // ----------------------

  // Update formData when profileInfo changes
  useEffect(() => {
    if (profileInfo) {
      setFormData((prev) => ({
        ...prev,
        name: profileInfo.personInfo.name,
        email: profileInfo.personInfo.email,
        address: profileInfo.personInfo.address,
        country:
          profileInfo.personInfo.country_id &&
          profileInfo.personInfo.country_id !== ""
            ? parseInt(profileInfo.personInfo.country_id)
            : null,
        state:
          profileInfo.personInfo.state_id &&
          profileInfo.personInfo.state_id !== ""
            ? parseInt(profileInfo.personInfo.state_id)
            : null,
        city:
          profileInfo.personInfo.city_id &&
          profileInfo.personInfo.city_id !== ""
            ? parseInt(profileInfo.personInfo.city_id)
            : null,
      }));
    }
  }, [profileInfo]);
  // get initial location states
  useEffect(() => {
    if (profileInfo && !stateDropdown?.length) {
      getState(
        profileInfo.personInfo.country_id &&
          profileInfo.personInfo.country_id !== ""
          ? { id: profileInfo.personInfo.country_id }
          : null
      );
    }
  }, [profileInfo, stateDropdown]);
  // get initial location cities
  useEffect(() => {
    if (profileInfo && !cityDropdown?.length) {
      getcity(
        profileInfo.personInfo.state_id &&
          profileInfo.personInfo.state_id !== ""
          ? { id: profileInfo.personInfo.state_id }
          : null
      );
    }
  }, [profileInfo, cityDropdown]);

  // Initialize countries data from static JSON
  // NOTE: This is for phone number input
  useEffect(() => {
    if (!getCountries) {
      setGetCountries(countries && countries.countries);
    }
  }, [getCountries]);

  // Set dropdown data for countries from profileInfo or (commented: fetch from API)
  useEffect(() => {
    if (profileInfo?.countries?.length) {
      setCountryDropdown(profileInfo.countries);
    }
  }, [profileInfo]);

  // Set default phone code and selected country
  const { default_phone_code } = settings();
  useEffect(() => {
    if (default_phone_code) {
      let defaultCountry =
        getCountries &&
        getCountries.length > 0 &&
        getCountries.find((item) => item.code === default_phone_code);
      if (defaultCountry) {
        const phoneValue = (() => {
          if (
            profileInfo &&
            profileInfo.personInfo.phone &&
            profileInfo.personInfo.phone !== "null"
          ) {
            return profileInfo.personInfo.phone;
          } else {
            return defaultCountry.dial_code;
          }
        })();
        handleInputChange("phone", phoneValue);
        setSelectedCountry(defaultCountry.code);
      }
    }
  }, [default_phone_code, getCountries]);

  // ----------------------
  // Handlers
  // ----------------------

  // Generic input change handler for form fields
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Country dropdown select handler
  const selectCountryhandler = (value) => {
    setSelectedCountry(value.code);
    handleInputChange("phone", value.dial_code);
    setCountryDropToggle(false);
  };

  /**
   * Handles getState functionality
   * @Initialization getState Api @const getStateListApi
   * @func getState
   */

  const [getStateListApi, { isLoading: isGetStateLoading }] =
    useLazyGetStateListApiQuery();

  const getState = async (value) => {
    if (value) {
      if (value?.id) {
        handleInputChange("country", value.id);
        const response = await getStateListApi({
          countryId: Number(value.id),
          token: auth()?.access_token,
        });
        if (response.isSuccess) {
          setCityDropdown(null);
          setStateDropdown(response?.data?.states);
        }
      } else {
        console.error(
          `Argument is not valid. Argument should be object with id Ex: "{ id: 1 }"`
        );
      }
    }
  };

  /**
   * Handles getCities functionality
   * @Initialization getCities Api @const getCityListApi
   * @func getCity
   */

  const [getCityListApi, { isLoading: isGetCityLoading }] =
    useLazyGetCityListApiQuery();

  const getcity = async (value) => {
    if (value) {
      if (value?.id) {
        handleInputChange("state", value.id);
        const response = await getCityListApi({
          stateId: Number(value.id),
          token: auth()?.access_token,
        });
        if (response.isSuccess) {
          setCityDropdown(response?.data?.cities);
        }
      } else {
        console.error(
          `Argument is not valid. Argument should be object with id Ex: "{ id: 1 }"`
        );
      }
    }
  };

  // Handler for city selection
  const selectCity = (value) => {
    handleInputChange("city", value.id);
  };

  // File input browse handler
  const browseprofileImg = () => {
    profileImgInput.current.click();
  };

  // File input change handler (profile image)
  const profileImgChangHandler = (e) => {
    if (e.target.value !== "") {
      const imgReader = new FileReader();
      imgReader.onload = (event) => {
        setprofileImg(event.target.result); // store image preview
      };
      imgReader.readAsDataURL(e.target.files[0]); // view
      setFormImag(e.target.files[0]);
    }
  };

  /**
   * Handles profile update functionality
   * @Initialization updateProfile Api @const updateProfileApi
   * @func updateProfileSuccessHandler @param data @param statusCode
   * @func updateProfileErrorHandler @param error
   * @func updateProfile
   */

  const [updateProfileApi, { isLoading: isUpdateProfileLoading }] =
    useUpdateProfileApiMutation();

  const updateProfileSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      toast.success(data?.notification);
    }
  };
  const updateProfileErrorHandler = (error) => {
    setErrors(error && error?.data?.errors);
  };

  const updateProfile = async () => {
    const formDataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      address: formData.address,
      image: formImg ? formImg : null,
      state: formData.state,
      city: formData.city,
      viewImage: profileImg,
    };

    await updateProfileApi({
      data: formDataToSend,
      token: auth()?.access_token,
      success: updateProfileSuccessHandler,
      error: updateProfileErrorHandler,
    });
  };

  if (profileInfo) {
    return (
      <>
        {/* Main form layout */}
        <div className="flex lg:flex-row flex-col-reverse space-x-8 rtl:space-x-reverse">
          {/* Left: Form fields */}
          <div className="lg:w-[570px] w-full ">
            {/* Name input */}
            <div className="input-item mb-8">
              <InputCom
                label={ServeLangItem()?.Name}
                placeholder="Name"
                type="text"
                inputClasses="h-[50px]"
                value={formData.name}
                error={!!(errors && Object.hasOwn(errors, "name"))}
                inputHandler={(e) => handleInputChange("name", e.target.value)}
              />
              {errors && Object.hasOwn(errors, "name") ? (
                <span className="text-sm mt-1 text-qred">{errors.name[0]}</span>
              ) : (
                ""
              )}
            </div>
            {/* Email (read-only) and Phone */}
            <div className="input-item md:flex md:space-x-2.5 rtl:space-x-reverse mb-8">
              {/* Email (read-only) */}
              <div className="md:w-1/2 w-full h-full mb-8 md:mb-0">
                <div>
                  <p className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                    {ServeLangItem()?.Email}
                    <span className="text-yellow-500 text-xs ml-1">
                      ({ServeLangItem()?.Read_Only})
                    </span>
                  </p>
                  <div className="w-full border border-yellow-500 px-6  h-[50px] bg-yellow-50 text-dark-gray flex items-center cursor-not-allowed">
                    {formData.email}
                  </div>
                </div>
              </div>
              {/* Phone input with country dropdown */}
              <div className="md:w-1/2 w-full h-full relative">
                <InputCom
                  label={ServeLangItem()?.Phone_Number}
                  placeholder={ServeLangItem()?.Phone_Number}
                  type="text"
                  inputClasses="h-[50px] placeholder:capitalize pl-20"
                  value={formData.phone ? formData.phone : ""}
                  inputHandler={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                  error={!!(errors && Object.hasOwn(errors, "phone"))}
                />
                {errors && Object.hasOwn(errors, "phone") ? (
                  <span className="text-sm mt-1 text-qred">
                    {errors.phone[0]}
                  </span>
                ) : (
                  ""
                )}
                {/* Country dropdown button */}
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
                {/* Country dropdown list */}
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
            </div>
            {/* Country dropdown */}
            <div className="mb-6">
              <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                {ServeLangItem()?.Country}*
              </h1>
              <div
                className={`w-full h-[50px] border border-qgray-border flex justify-between items-center mb-2 ${
                  !!(errors && Object.hasOwn(errors, "country"))
                    ? "border-qred"
                    : "border-qgray-border"
                }`}
              >
                <Selectbox
                  action={getState}
                  className="w-full px-5"
                  defaultValue={
                    countryDropdown &&
                    countryDropdown.length > 0 &&
                    (function () {
                      let item =
                        countryDropdown.length > 0 &&
                        countryDropdown.find(
                          (item) =>
                            parseInt(item.id) ===
                            parseInt(profileInfo.personInfo.country_id)
                        );
                      return item ? item.name : "Select";
                    })()
                  }
                  datas={countryDropdown && countryDropdown}
                >
                  {({ item }) => (
                    <>
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <span className="text-[13px] text-qblack">
                            {item}
                          </span>
                        </div>
                        <span>
                          <ArrowDownIco />
                        </span>
                      </div>
                    </>
                  )}
                </Selectbox>
              </div>
              {errors && Object.hasOwn(errors, "country") ? (
                <span className="text-sm mt-1 text-qred">
                  {errors.country[0]}
                </span>
              ) : (
                ""
              )}
            </div>
            {/* State and City dropdowns */}
            <div className="md:flex md:space-x-5 rtl:space-x-reverse items-center mb-6">
              {/* State dropdown */}
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                  {ServeLangItem()?.State}*
                </h1>
                <div
                  className={`w-full h-[50px] border border-qgray-border flex justify-between items-center mb-2 ${
                    !!(errors && Object.hasOwn(errors, "state"))
                      ? "border-qred"
                      : "border-qgray-border"
                  }`}
                >
                  <Selectbox
                    action={getcity}
                    className="w-full px-5"
                    defaultValue={
                      profileInfo.states &&
                      profileInfo.states.length > 0 &&
                      (function () {
                        let item = profileInfo.states.find(
                          (item) =>
                            item.id ===
                            parseInt(profileInfo.personInfo.state_id)
                        );
                        return item ? item.name : "Select";
                      })()
                    }
                    datas={stateDropdown && stateDropdown}
                  >
                    {({ item }) => (
                      <>
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <span className="text-[13px] text-qblack">
                              {item}
                            </span>
                          </div>
                          <span>
                            <ArrowDownIco />
                          </span>
                        </div>
                      </>
                    )}
                  </Selectbox>
                </div>
                {errors && Object.hasOwn(errors, "state") ? (
                  <span className="text-sm mt-1 text-qred">
                    {errors.state[0]}
                  </span>
                ) : (
                  ""
                )}
              </div>
              {/* City dropdown */}
              <div className="md:w-1/2 w-full">
                <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                  {ServeLangItem()?.City}*
                </h1>
                <div
                  className={`w-full h-[50px] border border-qgray-border flex justify-between items-center mb-2 ${
                    !!(errors && Object.hasOwn(errors, "city"))
                      ? "border-qred"
                      : "border-qgray-border"
                  }`}
                >
                  <Selectbox
                    action={selectCity}
                    className="w-full px-5"
                    defaultValue={
                      profileInfo.cities &&
                      profileInfo.cities.length > 0 &&
                      (function () {
                        let item = profileInfo.cities.find(
                          (item) =>
                            item.id === parseInt(profileInfo.personInfo.city_id)
                        );
                        return item ? item.name : "Select";
                      })()
                    }
                    datas={cityDropdown && cityDropdown}
                  >
                    {({ item }) => (
                      <>
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <span className="text-[13px] text-qblack">
                              {item}
                            </span>
                          </div>
                          <span>
                            <ArrowDownIco />
                          </span>
                        </div>
                      </>
                    )}
                  </Selectbox>
                </div>
                {errors && Object.hasOwn(errors, "city") ? (
                  <span className="text-sm mt-1 text-qred">
                    {errors.city[0]}
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
            {/* Address input */}
            <div className="input-item mb-8">
              <InputCom
                label={ServeLangItem()?.Address}
                placeholder={ServeLangItem()?.Your_address_Here}
                type="text"
                inputClasses="h-[50px]"
                value={formData.address}
                inputHandler={(e) =>
                  handleInputChange("address", e.target.value)
                }
                error={!!(errors && Object.hasOwn(errors, "address"))}
              />
              {errors && Object.hasOwn(errors, "address") ? (
                <span className="text-sm mt-1 text-qred">
                  {errors.address[0]}
                </span>
              ) : (
                ""
              )}
            </div>
          </div>
          {/* Right: Profile image section */}
          <div className="flex-1">
            <div className="update-logo w-full mb-9">
              <h1 className="text-xl tracking-wide font-bold text-qblack flex items-center mb-2">
                {ServeLangItem()?.Update_Profile}
                <span className="ml-1">
                  <InfoQuestion />
                </span>
              </h1>
              <p className="text-sm text-qgraytwo mb-5 ">
                {ServeLangItem()?.Profile_of_at_least_Size}
                <span className="ml-1 text-qblack">300x300</span>
              </p>
              <div className="flex xl:justify-center justify-start">
                <div className="relative">
                  <div className="sm:w-[198px] sm:h-[198px] w-[199px] h-[199px] rounded-full overflow-hidden relative">
                    <Image
                      layout="fill"
                      src={
                        profileImg
                          ? profileImg
                          : `${appConfig.BASE_URL + getImg}`
                      }
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <input
                    ref={profileImgInput}
                    onChange={(e) => profileImgChangHandler(e)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={browseprofileImg}
                    className="w-[32px] h-[32px] absolute bottom-7 right-0  bg-qyellow rounded-full cursor-pointer"
                  >
                    <EditPen />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="action-area flex space-x-4 rtl:space-x-reverse items-center">
          <button
            onClick={() => router.back()}
            type="button"
            className="text-sm text-qred font-semibold"
          >
            {ServeLangItem()?.Cancel}
          </button>
          <button
            onClick={updateProfile}
            type="button"
            disabled={isUpdateProfileLoading}
            className="w-[164px] h-[50px] disabled:cursor-not-allowed bg-qyellow font-semibold text-qblack text-sm"
          >
            {ServeLangItem()?.Update_Profile}
          </button>
        </div>
      </>
    );
  }
}
