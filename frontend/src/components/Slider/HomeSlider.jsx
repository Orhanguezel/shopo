import React from "react";
import Slider from ".";
import Link from "next/link";
import Image from "next/image";
import ShopNowBtn from "../Helpers/Buttons/ShopNowBtn";

function HomeSlider({ images, settings }) {
  return (
    <Slider {...settings} className="w-full h-full home-slider">
      {images.length > 0 &&
        images.map((item, i) => (
          <div key={i} className="item w-full h-full group relative overflow-hidden">
            <Image
                src={process.env.NEXT_PUBLIC_BASE_URL + item.image}
                alt={item.title_two}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                loading={i === 0 ? "eager" : "lazy"}
            />
            
            <div className="flex w-full max-w-full h-full relative items-center rtl:pr-[30px] ltr:pl-[30px] z-10">
              <div className="relative z-20 max-w-[90%] md:max-w-xl flex flex-col items-start">
                <div className="inline-block md:w-[112px] w-[100px] shadow md:h-[25px] h-[18px] flex items-center justify-center bg-white rounded-full md:mb-[30px] mb-[15px]">
                  <span className="text-qblack uppercase md:text-xs text-[10px] font-semibold">
                    {item.badge}
                  </span>
                </div>
                <div className="md:mb-[30px] mb-[15px] space-y-2">
                  <p className="inline-block md:text-[50px] text-[20px] leading-tight text-qblack font-semibold bg-white/80 px-4 py-1 rounded-[10px] shadow-sm">
                    {item.title_one}
                  </p>
                  <div>
                    <h2 className="inline-block md:text-[50px] text-[24px] md:leading-[60px] text-qblack font-bold bg-white/90 px-6 py-2 rounded-[15px] shadow-md border border-white/50">
                      {item.title_two}
                    </h2>
                  </div>
                </div>
                <div className="w-auto bg-white/90 p-2 rounded-full shadow-sm">
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
