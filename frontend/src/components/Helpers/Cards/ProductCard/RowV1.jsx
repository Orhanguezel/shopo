import Image from "next/image";
import Star from "../../icons/Star";
import CurrencyConvert from "@/components/Shared/CurrencyConvert";
import CheckProductIsExistsInFlashSale from "@/components/Shared/CheckProductIsExistsInFlashSale";
import ServeLangItem from "../../ServeLangItem";
import Link from "next/link";
import QuickViewIco from "../../icons/QuickViewIco";
import ThinLove from "../../icons/ThinLove";
import Compair from "../../icons/Compair";

function RowV1({
  styleType,
  datas,
  offerPrice,
  price,
  isProductInFlashSale,
  addToCart,
  quickViewHandler,
  arWishlist,
  addToWishlist,
  removeToWishlist,
  wishlisted,
  addToCompare,
}) {
  return (
    <div className={`w-full relative`}>
      <div
        data-aos="fade-left"
        className={`product-card-${styleType}  w-full lg:h-[250px] h-[200px] bg-white group relative overflow-hidden `}
      >
        <div className="flex space-x-5 items-center w-full h-full lg:p-[30px] sm:p-5 p-2">
          <div className="lg:w-1/2 w-1/3 h-full relative transform scale-100 group-hover:scale-110 transition duration-300 ease-in-ou">
            <Image
              fill
              sizes="100%"
              style={{ objectFit: "scale-down" }}
              src={`${datas.image}`}
              alt={datas.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full">
            <div>
              {/* reviews */}
              <div className="flex space-x-1 mb-3">
                {Array.from(Array(datas.review), () => (
                  <span key={datas.review + Math.random()}>
                    <Star />
                  </span>
                ))}
                {datas.review < 5 && (
                  <>
                    {Array.from(Array(5 - datas.review), () => (
                      <span
                        key={datas.review + Math.random()}
                        className="text-gray-500"
                      >
                        <Star defaultValue={false} />
                      </span>
                    ))}
                  </>
                )}
              </div>

              <Link
                href={{
                  pathname: "/single-product",
                  query: { slug: datas.slug },
                }}
              >
                <p className="title mb-2 sm:text-[15px] text-[13px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-qyellow cursor-pointer">
                  {datas.title}
                </p>
              </Link>
              <p className="price mb-[26px]">
                <span
                  suppressHydrationWarning
                  className={`main-price  font-600 text-[18px] ${
                    offerPrice ? "line-through text-qgray" : "text-qred"
                  }`}
                >
                  {offerPrice ? (
                    <span>
                      {" "}
                      <CurrencyConvert price={price} />
                    </span>
                  ) : (
                    <>
                      {isProductInFlashSale && (
                        <span
                          className={`line-through text-qgray font-500 text-[16px] mr-2`}
                        >
                          <CurrencyConvert price={price} />
                        </span>
                      )}
                      <CheckProductIsExistsInFlashSale
                        id={datas.id}
                        price={price}
                      />
                    </>
                  )}
                </span>
                {offerPrice && (
                  <span
                    suppressHydrationWarning
                    className="offer-price text-qred font-600 text-[18px] ml-2"
                  >
                    <CheckProductIsExistsInFlashSale
                      id={datas.id}
                      price={offerPrice}
                    />
                  </span>
                )}
              </p>
              <button
                onClick={(e) => addToCart(datas.id, e)}
                type="button"
                data-product-id={datas.id}
                className="w-[110px] h-[30px]"
              >
                <span className="yellow-btn">
                  {ServeLangItem()?.Add_To_Cart}
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* quick-access-btns */}
        <div className="quick-access-btns flex flex-col space-y-2">
          <button
            className=" absolute group-hover:left-4 -left-10 top-5  transition-all ease-in-out"
            type="button"
            onClick={() => quickViewHandler(datas.slug)}
          >
            <span className="hover:bg-qyellow w-10 h-10 flex justify-center text-black hover:text-white items-center transition-all duration-300 ease-in-out hover-bg-qyellow bg-primarygray rounded">
              <QuickViewIco className="fill-current" />
            </span>
          </button>
          {!arWishlist ? (
            <button
              className=" absolute group-hover:left-4 -left-10 top-[60px] duration-300   transition-all ease-in-out"
              type="button"
              onClick={() => addToWishlist(datas.id)}
            >
              <span className="hover:bg-qyellow w-10 h-10 flex text-black hover:text-white justify-center items-center transition-all duration-300 ease-in-out hover-bg-qyellow bg-primarygray rounded">
                <ThinLove className="fill-current" />
              </span>
            </button>
          ) : (
            <button
              className=" absolute group-hover:left-4 -left-10 top-[60px] duration-300   transition-all ease-in-out"
              type="button"
              onClick={() => removeToWishlist(wishlisted && wishlisted.id)}
            >
              <span className="hover:bg-qyellow w-10 h-10 flex justify-center items-center bg-primarygray rounded">
                <ThinLove fill={true} />
              </span>
            </button>
          )}
          <button
            className=" absolute group-hover:left-4 -left-10 top-[107px]  transition-all duration-500 ease-in-out"
            type="button"
            onClick={() => addToCompare(datas.id)}
          >
            <span className="hover:bg-qyellow w-10 h-10 flex justify-center text-black hover:text-white transition-all duration-300 ease-in-out items-center hover-bg-qyellow bg-primarygray rounded">
              <Compair className="fill-current" />
            </span>
          </button>
        </div>
      </div>
      {/* on hover square animation */}
      <span className="anim bottom"></span>
      <span className="anim right"></span>
      <span className="anim top"></span>
      <span className="anim left"></span>
    </div>
  );
}

export default RowV1;
