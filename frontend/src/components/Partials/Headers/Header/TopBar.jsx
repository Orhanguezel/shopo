import Link from "next/link";
import { useEffect, useState } from "react";
import ServeLangItem from "../../../Helpers/ServeLangItem";
import { deleteCookie } from "cookies-next";

/**
 * Configuration constants for language handling
 */
const CONFIG = {
  COOKIE: {
    NAME: "googtrans",
    PATH: "/",
  },
  LANGUAGES: {
    DIRECTIONS: { LTR: "ltr", RTL: "rtl" },
  },
};

/**
 * Phone icon component for contact information display
 * Uses SVG for crisp rendering at any size
 */
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
    />
  </svg>
);

/**
 * Email icon component for contact information display
 * Uses SVG for crisp rendering at any size
 */
const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

/**
 * Sets the document's text direction attribute
 */
const setDocumentDirection = () =>
  document.body.setAttribute("dir", CONFIG.LANGUAGES.DIRECTIONS.LTR);

/**
 * Contact information display component
 * Shows phone and email with appropriate icons
 * @param {Object} contact - Object containing phone and email properties
 */
const ContactInfo = ({ contact }) => (
  <>
    {/* Phone contact information */}
    <div className="flex ltr:space-x-2 rtl:space-x-0 items-center rtl:ml-2 ltr:ml-0">
      <span className="rtl:ml-2 ltr:ml-0">
        <PhoneIcon />
      </span>
      <span className="text-xs text-qblack font-500 leading-none rtl:ml-2 ltr:ml-0">
        {contact?.phone}
      </span>
    </div>
    {/* Email contact information */}
    <div className="flex ltr:space-x-2 rtl:space-x-0 items-center">
      <span className="rtl:ml-2 ltr:ml-0">
        <EmailIcon />
      </span>
      <span className="text-xs text-qblack font-500 leading-none">
        {contact?.email}
      </span>
    </div>
  </>
);

/**
 * Currency selector dropdown component
 * Allows users to switch between different currencies
 * @param {Array} allCurrency - Array of available currencies
 * @param {Object} defaultCurrency - Currently selected currency
 * @param {Function} handler - Function to handle currency changes
 */
const CurrencySelector = ({ allCurrency, defaultCurrency, handler }) => {
  // Currency selector disabled - Only TL (Turkish Lira) is used
  // Para birimi seçici devre dışı - Sadece TL (Türk Lirası) kullanılıyor
  return null;
};

/**
 * Account link component that shows different content based on authentication status
 * Shows "Account" for logged-in users, "Login" for guests
 * @param {Object} auth - Authentication object from localStorage
 */
const AccountLink = ({ auth }) => {
  const linkClass = "text-xs leading-6 text-qblack font-500 cursor-pointer";

  if (auth) {
    // User is logged in - show account link
    return (
      <Link href="/profile#dashboard" className={linkClass}>
        {ServeLangItem()?.Account}
      </Link>
    );
  }

  // User is not logged in - show login link with responsive text
  return (
    <Link href="/login" aria-label={ServeLangItem()?.Login || "Giriş Yap"}>
      <span className={`${linkClass} lg:block hidden`}>
        {ServeLangItem()?.Account}
      </span>
      <span className={`${linkClass} lg:hidden block`}>
        {ServeLangItem()?.Login || "Giriş Yap"}
      </span>
    </Link>
  );
};

/**
 * TopBar component - Main header bar containing contact info and navigation
 *
 * @param {string} className - Additional CSS classes
 * @param {Object} contact - Contact information object with phone and email
 * @param {Object} topBarProps - Object containing currency data and handlers
 */
export default function TopBar({
  className,
  contact,
  topBarProps,
}) {
  const { allCurrency, defaultCurrency, handler } = topBarProps;

  // State for authentication status
  const [auth, setAuth] = useState(null);

  // Initialize authentication state from localStorage on component mount
  useEffect(() => {
    setAuth(JSON.parse(localStorage.getItem("auth")));
  }, []);

  // Force Turkish-only display by removing legacy translation cookies.
  useEffect(() => {
    deleteCookie(CONFIG.COOKIE.NAME, {
      path: CONFIG.COOKIE.PATH,
    });
    setDocumentDirection();
  }, []);

  return (
    <div
      className={`w-full bg-white h-10 border-b border-qgray-border ${
        className || ""
      }`}
    >
      <div className="container-x mx-auto h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Navigation links */}
          <div className="topbar-nav">
            <ul className="flex space-x-6">
              <li className="rtl:ml-6 ltr:ml-0">
                <AccountLink auth={auth} />
              </li>
              <li>
                <Link
                  href="/tracking-order"
                  className="text-xs leading-6 text-qblack font-500 cursor-pointer"
                >
                  {ServeLangItem()?.Track_Order}
                </Link>
              </li>
            </ul>
          </div>

          {/* Right side - Contact info and dropdowns (hidden on mobile) */}
          <div className="topbar-dropdowns lg:block hidden">
            <div className="flex ltr:space-x-6 rtl:-space-x-0 items-center">
              {/* Contact information (phone and email) */}
              <ContactInfo contact={contact} />

              {/* Currency selector dropdown */}
              <CurrencySelector
                allCurrency={allCurrency}
                defaultCurrency={defaultCurrency}
                handler={handler}
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
