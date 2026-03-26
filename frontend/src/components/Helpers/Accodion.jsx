import { useState } from "react";
import PlusIcon from "./icons/PlusIcon";
import MinusIcon from "./icons/MinusIcon";

export default function Accodion({ init, title, des }) {
  const [collaps, setCollaps] = useState(init || false);
  const handler = () => {
    setCollaps(!collaps);
  };
  return (
    <div
      className={`accordion-item w-full overflow-hidden ${
        collaps ? "bg-qyellow" : "bg-white"
      }`}
    >
      <button
        onClick={handler}
        type="button"
        className={`w-full h-[60px]  flex justify-between items-center px-5 ${
          collaps ? "text-white" : "text-qblack"
        }`}
      >
        <span className="sm:text-base text-sm font-semibold text-start capitalize">
          {title}
        </span>
        <span className="text-[#9A9A9A]">
          {collaps ? <MinusIcon /> : <PlusIcon />}
        </span>
      </button>
      {collaps && (
        <div className="faq-body p-5 border-t border-qgray-border">
          <div data-aos="fade-up">
            <div
              className={`sm:text-[15px] text-xs ${
                collaps ? "text-white" : ""
              }`}
              dangerouslySetInnerHTML={{
                __html: des,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
