"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import DataIteration from "../Helpers/DataIteration";
import FontAwesomeCom from "../Helpers/icons/FontAwesomeCom";
import PageTitle from "../Helpers/PageTitle";
import ServeLangItem from "../Helpers/ServeLangItem";
import settings from "../../utils/settings";
import appConfig from "@/appConfig";
import AboutUsSlider from "../Slider/AboutUsSlider";

const IMAGE_FALLBACK = "/assets/images/server-error.png";

export default function About({ aboutData }) {
  const aboutBanner =
    aboutData?.aboutUs?.banner_image
      ? `${appConfig.BASE_URL + aboutData.aboutUs.banner_image}`
      : IMAGE_FALLBACK;

  const settingTestimonial = {
    autoplay: {
      delay: 2500,
    },
    navigation: true,
    slidesPerView: 1,
    loop: true,
    gap: "30px",

    pagination: false,
    breakpoints: {
      768: {
        slidesPerView: 2,
        centeredSlides: false,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3.2,
        spaceBetween: 30,
        centeredSlides: true,
      },
    },
  };

  const { text_direction } = settings();
  useEffect(() => {
    const getSliderInitElement = document.querySelectorAll(
      ".feedback-slider-wrapper div > .item"
    );
    getSliderInitElement.forEach((item) =>
      item.setAttribute("dir", `${text_direction}`)
    );
  }, [text_direction]);
  return (
    <div className="about-page-wrapper w-full">
      <div className="title-area w-full">
        <PageTitle
          title={ServeLangItem()?.About_us}
          breadcrumb={[
            { name: ServeLangItem()?.home, path: "/" },
            { name: ServeLangItem()?.About_us, path: "/about" },
          ]}
        />
      </div>

      <div className="aboutus-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="w-full min-h-[665px] lg:flex lg:space-x-12 rtl:space-x-reverse items-center pb-10 lg:pb-0">
            <div className="md:w-[570px] w-full md:h-[560px] h-auto rounded overflow-hidden my-5 lg:my-0 relative">
              <Image
                layout="fill"
                src={aboutBanner}
                alt="about"
                className="w-full h-full"
              />
            </div>
            <div className="content flex-1">
              <div className="about-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: aboutData.aboutUs.description,
                  }}
                ></div>
              </div>

              <Link href="/contact">
                <div className="w-fit  h-10 mt-5 cursor-pointer">
                  <span className="yellow-btn px-5">
                    {ServeLangItem()?.Contact_Us}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="customer-feedback w-full bg-white py-[60px]">
        <div className="title flex justify-center mb-5">
          <h1 className="text-[30px] font-semibold text-qblack">
            {ServeLangItem()?.Customers_Feedback}
          </h1>
        </div>
        <div className="feedback-slider-wrapper w-vw relative overflow-hidden">
          <AboutUsSlider aboutData={aboutData} settings={settingTestimonial} />
        </div>
      </div>
      <div className="container-x mx-auto my-[60px]">
        <div
          data-aos="fade-down"
          className="best-services w-full bg-qyellow flex flex-col space-y-10 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center lg:h-[110px] px-10 lg:py-0 py-10"
        >
          {aboutData &&
            aboutData.services.map((item) => (
              <div key={item.id} className="item">
                <div className="flex space-x-5 rtl:space-x-reverse items-center">
                  <div>
                    <div>
                      <FontAwesomeCom
                        className="w-8 h-8 text-qblack"
                        icon={item.icon}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-qblack text-[15px] font-700 tracking-wide mb-1 uppercase">
                      {item.title}
                    </p>
                    <p className="text-sm text-qblack line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}
