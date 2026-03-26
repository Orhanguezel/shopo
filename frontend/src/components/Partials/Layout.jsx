"use client";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DiscountBanner from "../DiscountBanner";
import Drawer from "../Mobile/Drawer";
import Footer from "./Footers/Footer";
import Header from "./Headers/Header";
import { CSS_CLASSES } from "../../utils/layoutConstants";
import {
  useWebsiteSetup,
  useCurrencyManagement,
  useSubscriptionBanner,
  useDrawer,
} from "../../hooks/useLayout";
import auth from "@/utils/auth";
import { setWishlistData } from "@/redux/features/whishlist/whishlistSlice";
import {
  useLazyGetWishlistItemsApiQuery,
  useLazyCompareListApiQuery,
} from "@/redux/features/product/apiSlice";
import { setCompareProducts } from "@/redux/features/compareProduct/compareProductSlice";
import applyGoogleTranslateDOMPatch from "@/utils/google-translate-fix";

/**
 * Layout Component
 *
 * Main layout wrapper that provides the overall structure for the application.
 * Handles website settings, currency management, language support, and responsive navigation.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.childrenClasses - Additional CSS classes for the main content area
 * @returns {JSX.Element} Layout component
 */
export default function Layout({ children, childrenClasses }) {
  // Redux state
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const dispatch = useDispatch();

  /**
   * apply google translate dom patch for this dom error
   * @error Failed to execute 'removeChild'
   * Resolved by this patch @func applyGoogleTranslateDOMPatch()
   */
  useEffect(() => {
    applyGoogleTranslateDOMPatch();
  }, []);
  // ===================== CUSTOM HOOKS =====================

  // Website setup management
  const {
    settings,
    contact,
    languages,
    defaultLanguage,
    allCurrencies,
    error: websiteError,
    setError: setWebsiteError,
  } = useWebsiteSetup(websiteSetup);

  // Currency management
  const {
    defaultCurrency,
    toggleCurrency,
    setToggleCurrency,
    handleCurrencyChange,
    error: currencyError,
    setError: setCurrencyError,
  } = useCurrencyManagement();

  // Subscription banner management
  const { subscribeData } = useSubscriptionBanner(websiteSetup);

  // Mobile drawer management
  const { drawer, handleDrawerToggle } = useDrawer();

  // ===================== COMPUTED VALUES =====================

  /**
   * Processed languages data for header component
   */
  const processedLanguages = useMemo(() => {
    if (!languages || languages.length === 0) return [];

    return languages.map((language) => ({
      lang_code: language.lang_code,
      lang_name: language.lang_name,
    }));
  }, [languages]);

  /**
   * Top bar props for header component
   */
  const topBarProps = useMemo(
    () => ({
      defaultCurrency,
      allCurrency: allCurrencies,
      toggleCurrency,
      toggleHandler: setToggleCurrency,
      handler: handleCurrencyChange,
    }),
    [
      defaultCurrency,
      allCurrencies,
      toggleCurrency,
      setToggleCurrency,
      handleCurrencyChange,
    ]
  );

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
   * get compare items api
   * @Initializaing useLazyCompareListApiQuery @const compareListApi
   * @func getCompareItems @params data
   */
  const [compareListApi, { isLoading: isCompareListLoading }] =
    useLazyCompareListApiQuery();

  const getCompareItems = async () => {
    const userToken = auth()?.access_token;
    const result = await compareListApi({
      token: userToken,
    });
    if (result.status === "fulfilled") {
      dispatch(setCompareProducts(result?.data));
    }
  };

  useEffect(() => {
    if (auth()) {
      // get wishlist items
      getWishlistItems();
      // get compare items
      getCompareItems();
    }
  }, []);

  // ===================== RENDER =====================

  return (
    <>
      {/* Mobile Navigation Drawer */}
      <Drawer open={drawer} action={handleDrawerToggle} />

      {/* Main Layout Container */}
      <div className={CSS_CLASSES.LAYOUT_CONTAINER}>
        {/* Header Component */}
        <Header
          topBarProps={topBarProps}
          contact={contact}
          settings={settings}
          drawerAction={handleDrawerToggle}
          languagesApi={processedLanguages}
          defaultLanguage={defaultLanguage}
        />
        {/* Main Content Area */}
        <main
          className={`${CSS_CLASSES.MAIN_CONTENT} ${
            childrenClasses || CSS_CLASSES.DEFAULT_PADDING
          }`}
        >
          {children}
        </main>
        {/* Subscription Banner */}
        <DiscountBanner datas={subscribeData} />
        <Footer settings={settings} />
      </div>
    </>
  );
}
