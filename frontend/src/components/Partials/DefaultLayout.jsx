"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useDispatch } from "react-redux";
import { TawkLiveChat } from "tawk-react";
import hexToRgb from "@/utils/hexToRgb";
import settings from "@/utils/settings";
import { setupAction } from "@/redux/features/websiteSetup/websiteSetupSlice";
import { useGetDefaultSetupQuery } from "@/redux/features/websiteSetup/apiSlice";

import MaintenanceWrapper from "@/components/Partials/MaintenanceWrapper";
import Consent from "../Helpers/Consent";
import MessageWidget from "../MessageWidget";
import GoogleTagManager from "./LayoutHelpers/GoogleTagManager";
import AuthenticationModal from "./LayoutHelpers/AuthenticationModal";
import SimpleFlyingCart from "../Helpers/SimpleFlyingCart";
import FixedCartButton from "../Helpers/FixedCartButton";
import { ErrorBoundary } from "react-error-boundary";
import HomepageSkeleton from "../Helpers/Loaders/HomepageSkeleton";

function IgnoreTawkErrorFallback({ error }) {
  if (
    error &&
    error.message &&
    error.message.includes("[Tawk/Form]: InternalServerError")
  ) {
    return null;
  }
}

const LOCAL_STORAGE_KEYS = {
  DEFAULT_CURRENCY: "shopoDefaultCurrency",
  SETTINGS: "settings",
  PUSHER: "pusher",
  LANGUAGE: "language",
};

function DefaultLayoutContent({ children }) {
  const [twkData, setTwkData] = useState(null);
  const [gtagId, setGtagId] = useState(null);
  const [fbPixel, setFbPixel] = useState(null);
  const [messageWidget, setMessageWidget] = useState(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { text_direction, enable_multivendor } = settings();

  // API call for website setup data
  const { data: websiteSetupData, isLoading: siteLoading } =
    useGetDefaultSetupQuery();

  /**
   * Sets default currency in localStorage if not already set
   */
  const setDefaultCurrency = useCallback((currencies) => {
    if (typeof window === "undefined") return;

    const defaultCurrency =
      currencies?.find((item) => item.is_default?.toLowerCase() === "yes") ||
      {};

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.DEFAULT_CURRENCY)) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.DEFAULT_CURRENCY,
        JSON.stringify(defaultCurrency)
      );
    }
  }, []);

  /**
   * Applies theme colors to CSS custom properties
   */
  const applyThemeColors = useCallback((themeSettings) => {
    if (themeSettings?.theme_one && themeSettings?.theme_two) {
      const root = document.querySelector(":root");
      if (root) {
        root.style.setProperty(
          "--primary-color",
          hexToRgb(themeSettings.theme_one)
        );
        root.style.setProperty(
          "--secondary-color",
          hexToRgb(themeSettings.theme_two)
        );
      }
    }
  }, []);

  /**
   * Initializes message widget if conditions are met
   */
  const initializeMessageWidget = useCallback(
    (pusherInfo) => {
      if (typeof window === "undefined") return;

      const hasDefaults =
        localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE) &&
        localStorage.getItem(LOCAL_STORAGE_KEYS.DEFAULT_CURRENCY);

      if (hasDefaults && pusherInfo && !messageWidget) {
        setMessageWidget(pusherInfo);
      }
    },
    [messageWidget]
  );

  /**
   * Processes website setup data and initializes all necessary configurations
   */
  const processWebsiteSetup = useCallback(
    (data) => {
      const {
        currencies,
        setting,
        pusher_info,
        googleAnalytic,
        tawk_setting,
        facebookPixel,
        language,
        firebase_info,
      } = data;

      // Set default currency
      setDefaultCurrency(currencies);

      // Dispatch setup action and store in localStorage
      dispatch(setupAction(data));

      if (typeof window !== "undefined") {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SETTINGS,
          JSON.stringify(setting)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.PUSHER,
          JSON.stringify(pusher_info || null)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.LANGUAGE,
          JSON.stringify(language)
        );
      }

      // Set state values
      setGtagId(googleAnalytic?.analytic_id);
      setTwkData({
        widgetId: tawk_setting?.widget_id,
        propertyId: tawk_setting?.property_id,
      });
      setFbPixel(facebookPixel);

      // Initialize message widget
      initializeMessageWidget(pusher_info);

      // Apply theme colors
      applyThemeColors(setting);
    },
    [dispatch, setDefaultCurrency, initializeMessageWidget, applyThemeColors]
  );

  /**
   * Initializes Facebook Pixel
   */
  const initializeFacebookPixel = useCallback(async () => {
    if (!fbPixel || !fbPixel.app_id) return;

    try {
      const ReactPixel = (await import("react-facebook-pixel")).default;
      ReactPixel.init(fbPixel.app_id);
      ReactPixel.pageView();
    } catch (error) {
      console.error("Facebook Pixel initialization error:", error);
    }
  }, [fbPixel]);

  /**
   * Tracks page views for Facebook Pixel on route changes
   */
  const trackFacebookPixelPageView = useCallback(async () => {
    if (!fbPixel || !fbPixel.app_id || typeof window === "undefined") return;

    try {
      const ReactPixel = (await import("react-facebook-pixel")).default;
      ReactPixel.pageView();
    } catch (error) {
      console.error("Facebook Pixel page view error:", error);
    }
  }, [fbPixel]);

  // Process website setup data
  useEffect(() => {
    if (!websiteSetupData || siteLoading) return;
    processWebsiteSetup(websiteSetupData);
  }, [websiteSetupData, siteLoading, processWebsiteSetup]);

  // Initialize Facebook Pixel
  useEffect(() => {
    initializeFacebookPixel();
  }, [initializeFacebookPixel]);

  // Track route changes for Facebook Pixel
  useEffect(() => {
    trackFacebookPixelPageView();
  }, [pathname, searchParams, trackFacebookPixelPageView]);

  // Set text direction
  useEffect(() => {
    const html = document.getElementsByTagName("html");
    if (html[0]) {
      html[0].dir = text_direction;
    }
  }, [text_direction]);

  return (
    <>
      {/* Google Tag Manager */}
      {gtagId && <GoogleTagManager gTagId={gtagId} />}
      {/* Cookie Consent */}
      <Consent />

      {/* Main Content */}
      <MaintenanceWrapper>{children}</MaintenanceWrapper>

      {/* Tawk Live Chat */}
      {twkData && (
        <ErrorBoundary FallbackComponent={IgnoreTawkErrorFallback}>
          <TawkLiveChat
            propertyId={twkData.widgetId}
            widgetId={twkData.propertyId}
          />
        </ErrorBoundary>
      )}

      {/* Message Widget (for multivendor) */}
      {parseInt(enable_multivendor) === 1 && messageWidget && (
        <MessageWidget pusher={messageWidget} />
      )}

      {/* Authentication Modal */}
      <AuthenticationModal />

      {/* Simple Flying Cart Animation */}
      <SimpleFlyingCart />

      {/* Fixed Cart Button */}
      <FixedCartButton />
    </>
  );
}

export default function DefaultLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-white">
          <HomepageSkeleton />
        </div>
      }
    >
      <DefaultLayoutContent>{children}</DefaultLayoutContent>
    </Suspense>
  );
}
