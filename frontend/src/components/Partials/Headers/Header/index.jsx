"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ThinBag from "../../../Helpers/icons/ThinBag";
import Middlebar from "./Middlebar";
import Navbar from "./Navbar";
import TopBar from "./TopBar";
import appConfig from "@/appConfig";

export default function Header({
  topBarProps,
  drawerAction,
  settings,
  contact,
  languagesApi,
  defaultLanguage,
}) {
  const { cart } = useSelector((state) => state.cart);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (cart?.cartProducts) {
      setCartItems(cart.cartProducts);
    }
  }, [cart]);

  const cartItemsCount = cartItems.length;

  return (
    <header className="header-section-wrapper relative print:hidden">
      <TopBar
        languagesApi={languagesApi}
        defaultLanguage={defaultLanguage}
        topBarProps={topBarProps}
        contact={contact}
        className="quomodo-shop-top-bar"
      />

      <Middlebar
        settings={settings}
        className="quomodo-shop-middle-bar lg:block hidden"
      />

      {/* Mobile Header */}
      <div className="quomodo-shop-drawer lg:hidden block w-full h-[60px] bg-white">
        <div className="w-full h-full flex justify-between items-center px-5">
          {/* Menu Button */}
          <button onClick={drawerAction} className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="w-[200px] h-full relative">
            <Link href="/">
              {settings && (
                <Image
                  width={153}
                  height={44}
                  className="w-[153px] h-[44px] object-contain"
                  src={`${appConfig.BASE_URL}${settings.logo}`}
                  alt="Seyfibaba Logo"
                  priority
                />
              )}
            </Link>
          </div>

          {/* Cart Icon */}
          <div className="cart relative cursor-pointer">
            <Link href="/cart">
              <ThinBag />
            </Link>
            <span className="w-[18px] h-[18px] rounded-full bg-qyellow absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px]">
              {cartItemsCount}
            </span>
          </div>
        </div>
      </div>

      <Navbar className="quomodo-shop-nav-bar lg:block hidden" />
    </header>
  );
}
