"use client";
import { useEffect, useState } from "react";
import ArrowDownIcoCheck from "@/components/Helpers/icons/ArrowDownIcoCheck";
import InputCom from "@/components/Helpers/InputCom";
import Selectbox from "@/components/Helpers/Selectbox";
import ServeLangItem from "@/components/Helpers/ServeLangItem";
import MapComponent from "@/components/MapComponent/Index";
import {
  useLazyGetStateListApiQuery,
  useLazyGetCityListApiQuery,
  useLazyGetCountryListGuestApiQuery,
} from "@/redux/features/locations/apiSlice";
import auth from "@/utils/auth";
import settings from "@/utils/settings";

function GuestCheckoutAddressForm({
  fName,
  setFName,
  lName,
  setLName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  home,
  setHome,
  office,
  setOffice,
  country,
  setCountry,
  state,
  setState,
  city,
  setCity,
  guestLocation,
  setGuestLocation,
  errors,
  // this method works for shipping rule
  shippingHandler,
}) {
  const webSettings = settings();

  // Dropdown states
  const [countryDropdown, setCountryDropdown] = useState([]);
  const [stateDropdown, setStateDropdown] = useState(null);
  const [cityDropdown, setCityDropdown] = useState(null);

  // Initialization location hooks REDUX RTK QUERY
  const [getCountryListGuestApi] = useLazyGetCountryListGuestApiQuery();
  const [getStateListApi, { isLoading: isGetStateLoading }] =
    useLazyGetStateListApiQuery();
  const [getCityListApi, { isLoading: isGetCityLoading }] =
    useLazyGetCityListApiQuery();

  /**
   * Fetch country list on component mount
   */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getCountryListGuestApi();
        if (response.data) {
          setCountryDropdown(response.data.countries || []);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, [getCountryListGuestApi]);

  /**
   * Handles getState functionality
   * @param {Object} value - Selected country object with id
   */
  const getState = async (value) => {
    if (value) {
      if (value?.id) {
        setCountry(value.id);
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
   * @param {Object} value - Selected state object with id
   */
  const getcity = async (value) => {
    if (value) {
      if (value?.id) {
        setState(value.id);
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

  /**
   * Handler for city selection
   * @param {Object} value - Selected city object with id
   */
  const selectCity = (value) => {
    if (value) {
      if (value?.id) {
        setCity(value.id);
        shippingHandler(false, value.id);
      } else {
        console.error(
          `Argument is not valid. Argument should be object with id Ex: "{ id: 1 }"`
        );
      }
    }
  };
  return (
    <div className="w-full">
      <div className="form-area">
        <div className="mb-6">
          <div className="sm:flex sm:space-x-5 items-center">
            <div className="sm:w-1/2 w-full  mb-5 sm:mb-0">
              <InputCom
                label={ServeLangItem()?.First_Name + "*"}
                placeholder={ServeLangItem()?.Name}
                inputClasses="w-full h-[50px]"
                value={fName}
                inputHandler={(e) => setFName(e.target.value)}
                error={!!(errors && Object.hasOwn(errors, "fName"))}
              />
              {errors && Object.hasOwn(errors, "fName") ? (
                <span className="text-sm mt-1 text-qred">
                  {errors.fName[0]}
                </span>
              ) : (
                ""
              )}
            </div>
            <div className="sm:w-1/2 w-full">
              <InputCom
                label={ServeLangItem()?.Last_Name + "*"}
                placeholder={ServeLangItem()?.Name}
                inputClasses="w-full h-[50px]"
                value={lName}
                inputHandler={(e) => setLName(e.target.value)}
                error={!!(errors && Object.hasOwn(errors, "lName"))}
              />
              {errors && Object.hasOwn(errors, "lName") ? (
                <span className="text-sm mt-1 text-qred">
                  {errors.lName[0]}
                </span>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-5 items-center mb-6">
          <div className="sm:w-1/2 w-full">
            <InputCom
              label={ServeLangItem()?.Email_Address + "*"}
              placeholder={ServeLangItem()?.Email}
              inputClasses="w-full h-[50px]"
              value={email}
              inputHandler={(e) => setEmail(e.target.value)}
              error={!!(errors && Object.hasOwn(errors, "email"))}
            />
            {errors && Object.hasOwn(errors, "email") ? (
              <span className="text-sm mt-1 text-qred">{errors.email[0]}</span>
            ) : (
              ""
            )}
          </div>
          <div className="sm:w-1/2 w-full">
            <InputCom
              label={ServeLangItem()?.Phone_Number + "*"}
              placeholder="012 3  *******"
              inputClasses="w-full h-[50px]"
              value={phone}
              inputHandler={(e) => setPhone(e.target.value)}
              error={!!(errors && Object.hasOwn(errors, "phone"))}
            />
            {errors && Object.hasOwn(errors, "phone") ? (
              <span className="text-sm mt-1 text-qred">{errors.phone[0]}</span>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="mb-6">
          <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
            {ServeLangItem()?.Country}*
          </h1>
          <div
            className={`w-full h-[50px] border flex justify-between items-center mb-2 ${
              !!(errors && Object.hasOwn(errors, "country"))
                ? "border-qred"
                : "border-[#EDEDED]"
            }`}
          >
            <Selectbox
              action={getState}
              className="w-full px-5"
              defaultValue="Select"
              datas={countryDropdown && countryDropdown}
            >
              {({ item }) => (
                <>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span className="text-[13px] text-qblack">{item}</span>
                    </div>
                    <span>
                      <ArrowDownIcoCheck />
                    </span>
                  </div>
                </>
              )}
            </Selectbox>
          </div>
          {errors && Object.hasOwn(errors, "country") ? (
            <span className="text-sm mt-1 text-qred">{errors.country[0]}</span>
          ) : (
            ""
          )}
        </div>
        <div className="flex space-x-5 items-center mb-6">
          <div className="w-1/2">
            <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
              {ServeLangItem()?.State}*
            </h1>
            <div
              className={`w-full h-[50px] border flex justify-between items-center mb-2 ${
                !!(errors && Object.hasOwn(errors, "state"))
                  ? "border-qred"
                  : "border-[#EDEDED]"
              }`}
            >
              <Selectbox
                action={getcity}
                className="w-full px-5"
                defaultValue="Select"
                datas={stateDropdown && stateDropdown}
              >
                {({ item }) => (
                  <>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <span className="text-[13px] text-qblack">{item}</span>
                      </div>
                      <span>
                        <ArrowDownIcoCheck />
                      </span>
                    </div>
                  </>
                )}
              </Selectbox>
            </div>
            {errors && Object.hasOwn(errors, "state") ? (
              <span className="text-sm mt-1 text-qred">{errors.state[0]}</span>
            ) : (
              ""
            )}
          </div>
          <div className="w-1/2">
            <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
              {ServeLangItem()?.City}*
            </h1>
            <div
              className={`w-full h-[50px] border flex justify-between items-center mb-2 ${
                !!(errors && Object.hasOwn(errors, "city"))
                  ? "border-qred"
                  : "border-[#EDEDED]"
              }`}
            >
              <Selectbox
                action={selectCity}
                className="w-full px-5"
                defaultValue="select"
                datas={cityDropdown && cityDropdown}
              >
                {({ item }) => (
                  <>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <span className="text-[13px] text-qblack">{item}</span>
                      </div>
                      <span>
                        <ArrowDownIcoCheck />
                      </span>
                    </div>
                  </>
                )}
              </Selectbox>
            </div>
            {errors && Object.hasOwn(errors, "city") ? (
              <span className="text-sm mt-1 text-qred">{errors.city[0]}</span>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className=" mb-6">
          <div>
            <MapComponent
              location={guestLocation}
              locationHandler={setGuestLocation}
              mapKey={webSettings?.map_key}
              mapStatus={Number(webSettings?.map_status)}
              searchEnabled={Number(webSettings?.map_status) ? true : false}
              searchInputError={
                errors && Object.hasOwn(errors, "address") && errors.address[0]
              }
              searchInputHandler={setAddress}
              searchInputValue={address}
            />
          </div>
        </div>
        <div className="flex space-x-5 items-center ">
          <div className="flex space-x-2 items-center mb-10">
            <div>
              <input
                checked={home}
                onChange={() => {
                  setHome(!home);
                  setOffice(false);
                }}
                type="checkbox"
                name="home"
                id="home"
              />
            </div>
            <label
              htmlFor="home"
              className="text-qblack text-[15px] select-none capitalize"
            >
              {ServeLangItem()?.home}
            </label>
          </div>
          <div className="flex space-x-2 items-center mb-10">
            <div>
              <input
                checked={office}
                onChange={() => {
                  setOffice(!office);
                  setHome(false);
                }}
                type="checkbox"
                name="office"
                id="office"
              />
            </div>
            <label
              htmlFor="office"
              className="text-qblack text-[15px] select-none"
            >
              {ServeLangItem()?.Office}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestCheckoutAddressForm;
