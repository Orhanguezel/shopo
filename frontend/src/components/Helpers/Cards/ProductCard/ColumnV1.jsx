import Image from "next/image";
import Link from "next/link";
import Star from "../../icons/Star";
import CurrencyConvert from "@/components/Shared/CurrencyConvert";
import CheckProductIsExistsInFlashSale from "@/components/Shared/CheckProductIsExistsInFlashSale";
import QuickViewIco from "../../icons/QuickViewIco";
import ThinLove from "../../icons/ThinLove";
import Compair from "../../icons/Compair";
import ServeLangItem from "../../ServeLangItem";
import AddToCardIco from "../../icons/AddToCardIco";
import { buildProductPath } from "@/utils/url";

const PRODUCT_IMAGE_FALLBACK = "/assets/images/server-error.png";

function ColumnV1({
  styleType,
  datas,
  addToCart,
  offerPrice,
  price,
  isProductInFlashSale,
  arWishlist,
  addToWishlist,
  removeToWishlist,
  wishlisted,
  addToCompare,
}) {
  const productImage = datas?.image || PRODUCT_IMAGE_FALLBACK;

  return (
    <div className={`product-card-${styleType} relative`}>
      <div
        className="product-card-one w-full h-[445px] bg-white relative group overflow-hidden"
        style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
      >
        <Link
          href={buildProductPath(datas.slug)}
          className="product-card-img w-full h-[300px] -mt-2 block"
        >
          <div className="w-full h-full relative flex justify-center items-center transform scale-100 group-hover:scale-110 transition duration-300 ease-in-out">
            <Image
              src={productImage}
              alt={datas.title || "Profesyonel berber ve kuafor urunu gorseli"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "scale-down" }}
              className="object-contain"
              loading="lazy"
            />
          </div>
        </Link>
        <div className="product-card-details px-[30px] pb-[30px] relative pt-2">
          {/* add to card button */}
          <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[85px] transition-all duration-300 ease-in-out">
            <button
              onClick={(e) => addToCart(datas.id, e)}
              type="button"
              data-product-id={datas.id}
              className="yellow-btn group relative w-full h-full flex shadow  justify-center items-center overflow-hidden"
            >
              <div className="btn-content flex items-center space-x-3 rtl:space-x-reverse relative z-10">
                <span>
                  <AddToCardIco />
                </span>
                <span>{ServeLangItem()?.Add_To_Cart}</span>
              </div>
              <div className="bg-shape w-full h-full absolute  bg-qblack"></div>
            </button>
          </div>
          <div className="reviews flex space-x-[1px] mb-3">
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
          <Link href={buildProductPath(datas.slug)}>
            <h3 className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-qyellow cursor-pointer ">
              {datas.title}
            </h3>
          </Link>
          <p className="price">
            <span
              suppressHydrationWarning
              className={`main-price  font-600 text-[18px] ${
                offerPrice ? "line-through text-qgray" : "text-qred"
              }`}
            >
              {offerPrice ? (
                <span>
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
        </div>
        {/* quick-access-btns */}
        <div className="quick-access-btns flex flex-col space-y-2">
          <Link
            className=" absolute group-hover:right-4 -right-10 top-20  transition-all ease-in-out"
            href={buildProductPath(datas.slug)}
            aria-label={ServeLangItem()?.Quick_View || "Hızlı Bakış"}
          >
            <span className="hover:bg-qyellow w-10 h-10 flex justify-center text-black hover:text-white items-center transition-all duration-300 ease-in-out hover-bg-qyellow bg-primarygray rounded">
              <QuickViewIco className="fill-current" />
            </span>
          </Link>
          {!arWishlist ? (
            <button
              className=" absolute group-hover:right-4 -right-10 top-[120px]  transition-all duration-300 ease-in-out"
              type="button"
              onClick={() => addToWishlist(datas.id)}
              aria-label={ServeLangItem()?.Add_To_Wishlist || "Favorilere Ekle"}
            >
              <span className="hover:bg-qyellow w-10 h-10 flex text-black hover:text-white justify-center items-center transition-all duration-300 ease-in-out hover-bg-qyellow bg-primarygray rounded">
                <ThinLove className="fill-current" />
              </span>
            </button>
          ) : (
            <button
              className="absolute group-hover:right-4 -right-10 top-[120px]  transition-all duration-300 ease-in-out"
              type="button"
              onClick={() => removeToWishlist(wishlisted && wishlisted.id)}
              aria-label={ServeLangItem()?.Remove_From_Wishlist || "Favorilerden Çıkar"}
            >
              <span className="hover:bg-qyellow w-10 h-10 flex justify-center items-center bg-primarygray rounded">
                <ThinLove fill={true} />
              </span>
            </button>
          )}

          <button
            className=" absolute group-hover:right-4 -right-10 top-[168px]  transition-all duration-500 ease-in-out"
            type="button"
            onClick={() => addToCompare(datas.id)}
            aria-label={ServeLangItem()?.Add_To_Compare || "Karşılaştır"}
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

export default ColumnV1;
