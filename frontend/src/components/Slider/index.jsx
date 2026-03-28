import React, { Children } from "react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  A11y,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/a11y";

function Slider({ children, ...props }) {
  return (
    <Swiper
      {...props}
      modules={[
        Navigation,
        Pagination,
        Autoplay,
        EffectFade,
        A11y,
      ]}
    >
      {Children.map(children, (child) => (
        <SwiperSlide>{child}</SwiperSlide>
      ))}
    </Swiper>
  );
}
export default Slider;
