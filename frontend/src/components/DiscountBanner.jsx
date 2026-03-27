import SubscribeInputWidget from "./Helpers/SubscribeInputWidget";
import appConfig from "@/appConfig";
export default function DiscountBanner({ className, datas }) {
  return (
    <div
      className={`w-full min-h-[307px] bg-cover flex justify-center items-center print:hidden ${
        className || ""
      }`}
      style={{
        backgroundImage: `url(${
          datas?.image ? appConfig.BASE_URL + datas?.image : ""
        })`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <div className="py-10 px-4 max-w-2xl w-full mx-auto">
        <div data-aos="fade-up">
          <h1 className="sm:text-3xl text-xl font-700 text-qblack mb-2 text-center leading-tight">
            {datas?.header}
          </h1>
          <p className="text-center sm:text-[18px] text-sm font-400">
            {datas?.title}
          </p>
        </div>
        <div className="flex justify-center">
          <SubscribeInputWidget />
        </div>
      </div>
    </div>
  );
}
