import React, { Children } from "react";
import {
  Virtual,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
  Scrollbar,
  Parallax,
  FreeMode,
  Grid,
  Manipulation,
  Zoom,
  Controller,
  A11y,
  History,
  HashNavigation,
  Autoplay,
  EffectFade,
  EffectCube,
  EffectFlip,
  EffectCoverflow,
  EffectCards,
  EffectCreative,
  Thumbs,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/bundle";
import "swiper/css/a11y";
import "swiper/css/autoplay";
import "swiper/css/controller";
import "swiper/css/effect-cards";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-creative";
import "swiper/css/effect-cube";
import "swiper/css/effect-fade";
import "swiper/css/effect-flip";
import "swiper/css/free-mode";
import "swiper/css/grid";
import "swiper/css/hash-navigation";
import "swiper/css/history";
import "swiper/css/keyboard";
import "swiper/css/manipulation";
import "swiper/css/mousewheel";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/parallax";
import "swiper/css/scrollbar";
import "swiper/css/thumbs";
import "swiper/css/virtual";
import "swiper/css/zoom";

function Slider({ children, ...props }) {
  return (
    <Swiper
      {...props}
      modules={[
        Virtual,
        Keyboard,
        Mousewheel,
        Navigation,
        Pagination,
        Scrollbar,
        Parallax,
        FreeMode,
        Grid,
        Manipulation,
        Zoom,
        Controller,
        A11y,
        History,
        HashNavigation,
        Autoplay,
        EffectFade,
        EffectCube,
        EffectFlip,
        EffectCoverflow,
        EffectCards,
        EffectCreative,
        Thumbs,
      ]}
    >
      {Children.map(children, (child) => (
        <SwiperSlide>{child}</SwiperSlide>
      ))}
    </Swiper>
  );
}
export default Slider;
