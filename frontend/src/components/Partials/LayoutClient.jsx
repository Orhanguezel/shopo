"use client";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import hexToRgb from "@/utils/hexToRgb";
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
import { setWishlistData } from "@/redux/features/wishlist/wishlistSlice";
import { setupAction } from "@/redux/features/websiteSetup/websiteSetupSlice";
import {
  useLazyGetWishlistItemsApiQuery,
  useLazyCompareListApiQuery,
} from "@/redux/features/product/apiSlice";
import { setCompareProducts } from "@/redux/features/compareProduct/compareProductSlice";
import applyGoogleTranslateDOMPatch from "@/utils/google-translate-fix";

export default function LayoutClient({ children, childrenClasses, websiteSetupData }) {
  // Redux state
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const dispatch = useDispatch();

  // Write language to localStorage IMMEDIATELY (before any child renders)
  // This prevents the race condition where children call ServeLangItem()
  // before useEffect populates localStorage
  if (typeof window !== "undefined" && websiteSetupData?.language) {
    const currentLang = localStorage.getItem("language");
    // Always write server-fetched language to ensure consistency
    if (!currentLang || currentLang === "{}") {
      localStorage.setItem("language", JSON.stringify(websiteSetupData.language));
      localStorage.setItem("shopoDefaultLanguage", JSON.stringify(websiteSetupData.language));
    }
  }

  useEffect(() => {
    applyGoogleTranslateDOMPatch();
  }, []);

  useEffect(() => {
    if (!websiteSetupData) return;

    dispatch(setupAction(websiteSetupData));

    if (typeof window === "undefined") return;

    const { setting, pusher_info, language, currencies } = websiteSetupData;

    if (setting?.theme_one && setting?.theme_two) {
      const root = document.querySelector(":root");
      if (root) {
        root.style.setProperty("--primary-color", hexToRgb(setting.theme_one));
        root.style.setProperty(
          "--secondary-color",
          hexToRgb(setting.theme_two)
        );
      }
    }

    const defaultCurrency =
      currencies?.find((item) => item.is_default?.toLowerCase() === "yes") ||
      {};

    if (!localStorage.getItem("shopoDefaultCurrency")) {
      localStorage.setItem("shopoDefaultCurrency", JSON.stringify(defaultCurrency));
    }

    localStorage.setItem("settings", JSON.stringify(setting || null));
    localStorage.setItem("pusher", JSON.stringify(pusher_info || null));
    localStorage.setItem("language", JSON.stringify(language || {}));
    localStorage.setItem("shopoDefaultLanguage", JSON.stringify(language || {}));
  }, [websiteSetupData, dispatch]);

  // Website setup management
  const {
    settings,
    contact,
    languages,
    defaultLanguage,
    allCurrencies,
  } = useWebsiteSetup(websiteSetup);

  // Currency management
  const {
    defaultCurrency,
    toggleCurrency,
    setToggleCurrency,
    handleCurrencyChange,
  } = useCurrencyManagement();

  // Subscription banner management
  const { subscribeData } = useSubscriptionBanner(websiteSetup);

  // Mobile drawer management
  const { drawer, handleDrawerToggle } = useDrawer();

  const processedLanguages = useMemo(() => {
    if (!languages || languages.length === 0) return [];

    return languages.map((language) => ({
      lang_code: language.lang_code,
      lang_name: language.lang_name,
    }));
  }, [languages]);

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

  const [getWishlistItemsApi] = useLazyGetWishlistItemsApiQuery();

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

  const [compareListApi] = useLazyCompareListApiQuery();

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
      getWishlistItems();
      getCompareItems();
    }
  }, []);

  return (
    <>
      <Drawer open={drawer} action={handleDrawerToggle} />
      <div className={CSS_CLASSES.LAYOUT_CONTAINER}>
        <Header
          topBarProps={topBarProps}
          contact={contact}
          settings={settings}
          drawerAction={handleDrawerToggle}
          languagesApi={processedLanguages}
          defaultLanguage={defaultLanguage}
        />
        <main
          className={`${CSS_CLASSES.MAIN_CONTENT} ${
            childrenClasses || CSS_CLASSES.DEFAULT_PADDING
          }`}
        >
          {children}
        </main>
        <DiscountBanner datas={subscribeData} />
        <Footer settings={settings} />
      </div>
    </>
  );
}
