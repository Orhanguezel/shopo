"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

// Component imports
import Arrow from "../../../Helpers/icons/Arrow";
import FontAwesomeCom from "../../../Helpers/icons/FontAwesomeCom";
import Multivendor from "../../../Shared/Multivendor";
import ServeLangItem from "../../../Helpers/ServeLangItem";
import appConfig from "@/appConfig";

/**
 * Navbar Component
 * Main navigation component with category dropdown, mega menu, and navigation links
 * @param {string} className - Additional CSS classes
 */
export default function Navbar({ className }) {
  // Redux state
  const { websiteSetup } = useSelector((state) => state.websiteSetup);

  // Extract data from websiteSetup
  const categoryList = websiteSetup?.payload?.productCategories;
  const megaMenuList = websiteSetup?.payload?.megaMenuCategories;
  const megaMenuBanner = websiteSetup?.payload?.megaMenuBanner;
  const customPages = websiteSetup?.payload?.customPages;

  // Local state
  const [categoryToggle, setToggle] = useState(false);
  const [subCatHeight, setHeight] = useState(null);

  /**
   * Toggle category dropdown visibility
   */
  const handleCategoryToggle = () => {
    setToggle(!categoryToggle);
  };

  /**
   * Close category dropdown when clicking outside
   */
  const handleOutsideClick = () => {
    setToggle(false);
  };

  // Update subcategory height when dropdown toggles
  useEffect(() => {
    if (categoryToggle) {
      const categorySelector = document.querySelector(".category-dropdown");
      if (categorySelector) {
        setHeight(categorySelector.offsetHeight);
      }
    }
  }, [categoryToggle]);

  /**
   * Render category item with icon and name
   */
  const renderCategoryItem = (item) => (
    <div className="flex items-center rtl:space-x-reverse space-x-6">
      <span>
        <FontAwesomeCom className="w-4 h-4" icon={item.icon} />
      </span>
      <span className="text-xs font-400">{item.name}</span>
    </div>
  );

  /**
   * Render arrow icon for navigation items
   */
  const renderArrowIcon = () => (
    <svg
      className="transform rtl:rotate-180 fill-current"
      width="6"
      height="9"
      viewBox="0 0 6 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.49805"
        y="0.818359"
        width="5.78538"
        height="1.28564"
        transform="rotate(45 1.49805 0.818359)"
      />
      <rect
        x="5.58984"
        y="4.90918"
        width="5.78538"
        height="1.28564"
        transform="rotate(135 5.58984 4.90918)"
      />
    </svg>
  );

  /**
   * Render category dropdown section
   */
  const renderCategoryDropdown = () => (
    <div className="category w-[270px] h-[53px] bg-white px-5 rounded-t-md mt-[6px] relative">
      {/* Category Toggle Button */}
      <button
        onClick={handleCategoryToggle}
        type="button"
        className="w-full h-full flex justify-between items-center"
      >
        <div className="flex rtl:space-x-reverse space-x-3 items-center">
          <span>
            <svg
              width="14"
              height="9"
              viewBox="0 0 14 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="14" height="1" />
              <rect y="8" width="14" height="1" />
              <rect y="4" width="10" height="1" />
            </svg>
          </span>
          <span className="text-sm font-600 text-qblacktext">
            {ServeLangItem()?.All_Categories}
          </span>
        </div>
        <div>
          <Arrow
            width="5.78538"
            height="1.28564"
            className="fill-current text-qblacktext"
          />
        </div>
      </button>

      {/* Overlay to close dropdown */}
      {categoryToggle && (
        <div
          className="fixed top-0 left-0 w-full h-full -z-10"
          onClick={handleOutsideClick}
        />
      )}

      {/* Category Dropdown Menu */}
      <div
        style={{
          boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)",
        }}
        className={`category-dropdown w-full absolute left-0 top-[53px] ${
          categoryToggle ? "block" : "hidden"
        }`}
      >
        <ul className="categories-list relative">
          {categoryList?.map((item) => (
            <li key={item.id} className="category-item">
              {/* Main Category Link */}
              <Link
                href={{
                  pathname: "/products",
                  query: { category: item.slug },
                }}
              >
                <div className="flex justify-between items-center px-5 h-10 transition-all duration-300 ease-in-out cursor-pointer">
                  {renderCategoryItem(item)}
                  <div>{renderArrowIcon()}</div>
                </div>
              </Link>

              {/* Sub-categories Level 2 */}
              <div
                className={`sub-category-lvl-two absolute ltr:left-[270px] rtl:right-[270px] top-0 z-10 w-[270px] ${
                  item.active_sub_categories.length > 0 ? "bg-white" : ""
                }`}
                style={{ height: `${subCatHeight}px` }}
              >
                <ul>
                  {item.active_sub_categories.length > 0 &&
                    item.active_sub_categories.map((subItem) => (
                      <li key={subItem.id} className="category-item">
                        <Link
                          href={{
                            pathname: "/products",
                            query: { sub_category: subItem.slug },
                          }}
                        >
                          <div className="flex justify-between items-center px-5 h-10 transition-all duration-300 ease-in-out cursor-pointer">
                            <div>
                              <span className="text-xs font-400">
                                {subItem.name}
                              </span>
                            </div>
                            <div>{renderArrowIcon()}</div>
                          </div>
                        </Link>

                        {/* Sub-categories Level 3 */}
                        <div
                          className={`sub-category-lvl-three absolute ltr:left-[270px] rtl:right-[270px] top-0 z-10 w-[270px] ${
                            subItem.active_child_categories.length > 0
                              ? "bg-white"
                              : ""
                          }`}
                          style={{ height: `${subCatHeight}px` }}
                        >
                          <ul>
                            {subItem.active_child_categories.length > 0 &&
                              subItem.active_child_categories.map(
                                (subsubitem) => (
                                  <li
                                    key={subsubitem.id}
                                    className="category-item"
                                  >
                                    <Link
                                      href={{
                                        pathname: "/products",
                                        query: {
                                          child_category: subsubitem.slug,
                                        },
                                      }}
                                    >
                                      <div className="flex justify-between items-center px-5 h-10 transition-all duration-300 ease-in-out cursor-pointer">
                                        <div>
                                          <span className="text-xs font-400">
                                            {subsubitem.name}
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                )
                              )}
                          </ul>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  /**
   * Render mega menu section
   */
  const renderMegaMenu = () => (
    <div className="sub-menu w-full absolute left-0 top-[60px]">
      <div
        className="mega-menu-wrapper w-full bg-white p-[30px] flex justify-between items-center"
        style={{
          minHeight: "295px",
          boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)",
        }}
      >
        {/* Categories Section */}
        <div className="categories-wrapper flex-1 h-full flex justify-around -ml-[70px]">
          {megaMenuList?.slice(0, 3).map((megaItem) => (
            <div key={megaItem.id}>
              <div className="category">
                <h1 className="text-[13px] font-700 text-qblack uppercase mb-[13px]">
                  {megaItem.category.name}
                </h1>
              </div>
              <div className="category-items">
                <ul className="flex flex-col space-y-2">
                  {megaItem.sub_categories.length > 0 &&
                    megaItem.sub_categories.map((subItem) => (
                      <li key={subItem.id}>
                        <Link
                          href={{
                            pathname: "/products",
                            query: {
                              sub_category: subItem.sub_category?.slug,
                            },
                          }}
                        >
                          <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                            {subItem.sub_category?.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Mega Menu Banner */}
        {megaMenuBanner && parseInt(megaMenuBanner.status) === 1 && (
          <div
            style={{
              backgroundImage: `url(${
                appConfig.BASE_URL + megaMenuBanner.image
              })`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
            className="thumbnil w-[348px] h-[235px] relative flex items-center ltr:pl-[40px] rtl:pr-[40px] group"
          >
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-[10px]">
                  <span className="text-qblack uppercase text-xs font-semibold">
                    {megaMenuBanner.title_one}
                  </span>
                </div>
                <div className="mb-[30px]">
                  <h1 className="w-[160px] text-[24px] leading-[32px] text-qblack font-semibold">
                    {megaMenuBanner.title_two}
                  </h1>
                </div>
              </div>
              <div className="w-auto">
                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      category: megaMenuBanner.product_slug,
                    },
                  }}
                >
                  <div className="cursor-pointer w-full relative">
                    <div className="inline-flex rtl:space-x-reverse space-x-1.5 items-center relative z-20">
                      <span className="text-sm text-qblack font-medium leading-[30px]">
                        {ServeLangItem()?.Shop_Now}
                      </span>
                      <span className="leading-[30px]">
                        <svg
                          className="transform rtl:rotate-180 fill-current"
                          width="7"
                          height="11"
                          viewBox="0 0 7 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="2.08984"
                            y="0.636719"
                            width="6.94219"
                            height="1.54271"
                            transform="rotate(45 2.08984 0.636719)"
                          />
                          <rect
                            x="7"
                            y="5.54492"
                            width="6.94219"
                            height="1.54271"
                            transform="rotate(135 7 5.54492)"
                          />
                        </svg>
                      </span>
                    </div>
                    <div className="w-[82px] transition-all duration-300 ease-in-out group-hover:h-4 h-[0px] bg-qyellow absolute left-0 bottom-0 z-10" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Render pages dropdown menu
   */
  const renderPagesDropdown = () => (
    <div className="sub-menu w-[220px] absolute left-0 top-[60px]">
      <div
        className="w-full bg-white flex justify-between items-center"
        style={{
          boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)",
        }}
      >
        <div className="categories-wrapper w-full h-full p-5">
          <div>
            <div className="category-items">
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link href="/privacy-policy">
                    <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                      {ServeLangItem()?.Privacy_Policy}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-condition">
                    <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                      {ServeLangItem()?.Term_and_Conditions}
                    </span>
                  </Link>
                </li>
                {Multivendor() === 1 && (
                  <li>
                    <Link href="seller-terms-condition">
                      <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                        {ServeLangItem()?.Seller_terms_and_conditions}
                      </span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/faq">
                    <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                      {ServeLangItem()?.FAQ}
                    </span>
                  </Link>
                </li>
                {/* Custom Pages */}
                {customPages?.length > 0 &&
                  customPages.map((item, i) => (
                    <li key={i}>
                      <Link href={`/${item.slug}`}>
                        <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                          {item.page_name}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render become seller button
   */
  const renderBecomeSellerButton = () => (
    <div className="become-seller-btn">
      <Link href="/become-seller">
        <div className="w-[161px] h-[40px] flex justify-center items-center cursor-pointer">
          <div className="flex rtl:space-x-reverse space-x-2 items-center">
            <span className="text-sm font-600">
              {ServeLangItem()?.Become_seller}
            </span>
            <span className="transform rtl:rotate-180 fill-current">
              <svg
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-current"
              >
                <rect
                  x="1.08984"
                  width="6.94106"
                  height="1.54246"
                  transform="rotate(45 1.08984 0)"
                />
                <rect
                  x="6"
                  y="4.9082"
                  width="6.94106"
                  height="1.54246"
                  transform="rotate(135 6 4.9082)"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div
      className={`nav-widget-wrapper w-full h-[60px] relative z-30 ${
        className || ""
      }`}
    >
      <div className="container-x mx-auto h-full">
        <div className="w-full h-full relative">
          <div className="w-full h-full flex justify-between items-center">
            {/* Left Section: Category Dropdown and Navigation */}
            <div className="category-and-nav flex xl:rtl:space-x-reverse space-x-7 rtl:space-x-reverse space-x-3 items-center">
              {/* Category Dropdown */}
              {renderCategoryDropdown()}

              {/* Main Navigation */}
              <div className="nav">
                <ul className="nav-wrapper flex xl:space-x-10 rtl:space-x-reverse space-x-5">
                  {/* Shop Menu */}
                  <li>
                    <span className="flex items-center text-sm font-600 cursor-pointer text-qblack">
                      <span>{ServeLangItem()?.Shop}</span>
                      <span className="ml-1.5">
                        <Arrow className="fill-current" />
                      </span>
                    </span>
                    {renderMegaMenu()}
                  </li>

                  {/* Pages Dropdown */}
                  <li className="relative">
                    <span className="flex items-center text-sm font-600 cursor-pointer text-qblack">
                      <span>{ServeLangItem()?.Pages}</span>
                      <span className="ml-1.5">
                        <Arrow className="fill-current" />
                      </span>
                    </span>
                    {renderPagesDropdown()}
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Section: Become Seller Button */}
            {Multivendor() === 1 && renderBecomeSellerButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
