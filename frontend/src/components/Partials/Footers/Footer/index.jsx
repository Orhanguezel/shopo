"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FontAwesomeCom from "../../../Helpers/icons/FontAwesomeCom";
import appConfig from "@/appConfig";

export default function Footer({ settings }) {
  // Get website setup data from Redux store
  const { websiteSetup } = useSelector((state) => state.websiteSetup);

  // Local state for footer content sections
  const [footerData, setFooterData] = useState({
    footerContent: null,
    socialLinks: null,
    firstColumn: null,
    secondColumn: null,
    thirdColumn: null,
  });

  // Initialize footer data from website setup
  useEffect(() => {
    if (websiteSetup?.payload) {
      const { payload } = websiteSetup;

      setFooterData({
        footerContent: payload.footer,
        socialLinks: payload.social_links,
        firstColumn: payload.footer_first_col,
        secondColumn: payload.footer_second_col,
        thirdColumn: payload.footer_third_col,
      });
    }
  }, [websiteSetup]);

  // Destructure footer data for easier access
  const { footerContent, socialLinks, firstColumn, secondColumn, thirdColumn } =
    footerData;

  return (
    <footer className="footer-section-wrapper bg-white print:hidden">
      <div className="container-x block mx-auto pt-[56px]">
        {/* Logo Section */}
        <div className="w-full flex flex-col items-center mb-[50px]">
          <div className="mb-[40px]">
            <Link href="/">
              {settings && (
                <div className="w-[153px] h-[44px] relative">
                  <Image
                    fill
                    sizes="100%"
                    style={{ objectFit: "scale-down" }}
                    src={`${appConfig.BASE_URL + settings.logo}`}
                    alt="logo"
                  />
                </div>
              )}
            </Link>
          </div>
          <div className="w-full h-[1px] bg-[#E9E9E9]"></div>
        </div>

        {/* Main Footer Content */}
        <div className="lg:flex justify-between mb-[50px]">
          {/* About Us Section */}
          <div className="lg:w-[424px] ml-0 w-full mb-10 lg:mb-0">
            <h1 className="text-[18] font-500 text-[#2F2F2F] mb-5">About Us</h1>
            <p className="text-[#9A9A9A] text-[15px] w-[247px] leading-[28px]">
              {footerContent?.about_us}
            </p>
          </div>

          {/* Footer Links Columns */}
          <div className="flex-1 lg:flex">
            {/* First Column */}
            <div className="lg:w-1/3 w-full mb-10 lg:mb-0">
              {firstColumn && (
                <>
                  <div className="mb-5">
                    <h6 className="text-[18] font-500 text-[#2F2F2F]">
                      {firstColumn.columnTitle}
                    </h6>
                  </div>
                  <div>
                    <ul className="flex flex-col space-y-4">
                      {firstColumn.col_links?.length > 0 &&
                        firstColumn.col_links.map((item, i) => (
                          <li key={i}>
                            <Link href={item.link}>
                              <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                                {item.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Second Column */}
            <div className="lg:w-1/3 lg:flex lg:flex-col items-center w-full mb-10 lg:mb-0">
              <div>
                {secondColumn && (
                  <>
                    <div className="mb-5">
                      <h6 className="text-[18] font-500 text-[#2F2F2F]">
                        {secondColumn.columnTitle}
                      </h6>
                    </div>
                    <div>
                      <ul className="flex flex-col space-y-4">
                        {secondColumn.col_links?.length > 0 &&
                          secondColumn.col_links.map((item, i) => (
                            <li key={i}>
                              <Link href={item.link}>
                                <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                                  {item.title}
                                </span>
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Third Column */}
            <div className="lg:w-1/3 lg:flex lg:flex-col items-center w-full mb-10 lg:mb-0">
              <div>
                {thirdColumn && (
                  <>
                    <div className="mb-5">
                      <h6 className="text-[18] font-500 text-[#2F2F2F]">
                        {thirdColumn.columnTitle}
                      </h6>
                    </div>
                    <div>
                      <ul className="flex flex-col space-y-4">
                        {thirdColumn.col_links?.length > 0 &&
                          thirdColumn.col_links.map((item, i) => (
                            <li key={i}>
                              <Link href={item.link}>
                                <span className="text-[#9A9A9A] text-[15px] hover:text-qblack border-b border-transparent hover:border-qblack cursor-pointer capitalize">
                                  {item.title}
                                </span>
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Copyright & Social Links */}
        <div className="bottom-bar border-t border-qgray-border lg:h-[82px] flex lg:flex-row flex-col-reverse justify-between items-center">
          {/* Social Links & Copyright */}
          <div className="flex rtl:space-x-reverse lg:space-x-5 space-x-2.5 justify-between items-center mb-3">
            <div className="flex rtl:space-x-reverse space-x-5 items-center">
              {/* Social Media Links */}
              {socialLinks?.length > 0 &&
                socialLinks.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer">
                    <FontAwesomeCom
                      className="w-4 h-4 text-qgray"
                      icon={item.icon}
                    />
                  </a>
                ))}
            </div>

            {/* Copyright Text */}
            <span className="sm:text-base text-[10px] text-qgray font-300">
              {footerContent?.copyright || ""}
            </span>
          </div>

          {/* Payment Methods */}
          {footerContent?.payment_image && (
            <div className="mt-2 lg:mt-0">
              <Link href="#">
                <Image
                  width={318}
                  height={28}
                  src={`${appConfig.BASE_URL + footerContent.payment_image}`}
                  alt="payment-getways"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
