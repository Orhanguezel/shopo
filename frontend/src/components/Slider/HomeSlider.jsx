import React from "react";
import Slider from ".";
import Link from "next/link";
import ShopNowBtn from "../Helpers/Buttons/ShopNowBtn";

function HomeSlider({ images, settings }) {
  return (
    <Slider {...settings} className="w-full h-full home-slider">
      {images.length > 0 &&
        images.map((item, i) => (
          <div key={i} className="item w-full h-full group">
            <div
              style={{
                backgroundImage: `url(${
                  process.env.NEXT_PUBLIC_BASE_URL + item.image
                })`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
              className="flex w-full max-w-full h-full  relative items-center rtl:pr-[30px] ltr:pl-[30px]"
            >
              <div>
                <div className=" md:w-[112px] w-[100px] shadow md:h-[25px] h-[18px] flex items-center justify-center  bg-white rounded-full md:mb-[30px] mb-[15px]">
                  <span className="text-qblack uppercase md:text-xs text-[10px] font-semibold">
                    {item.badge}
                  </span>
                </div>
                <div className="md:mb-[30px] mb-[15px]">
                  <p className="md:text-[50px] text-[20px] leading-none text-qblack md:mb-3">
                    {item.title_one}
                  </p>
                  <h1 className="md:text-[50px] text-[20px] md:w-[400px] md:leading-[66px] text-qblack font-bold">
                    {item.title_two}
                  </h1>
                </div>
                <div className="w-auto">
                  <Link
                    href={{
                      pathname: "/single-product",
                      query: { slug: item.product_slug },
                    }}
                  >
                    <ShopNowBtn />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
    </Slider>
  );
}

export default HomeSlider;
