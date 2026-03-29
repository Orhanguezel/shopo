import CheckProductIsExistsInFlashSale from "@/components/Shared/CheckProductIsExistsInFlashSale";
import CurrencyConvert from "@/components/Shared/CurrencyConvert";
import Image from "next/image";
import Link from "next/link";
import { buildProductPath } from "@/utils/url";

const PRODUCT_IMAGE_FALLBACK = "/assets/images/server-error.png";

function RowV2({ styleType, datas, offerPrice, price, isProductInFlashSale }) {
  const productImage = datas?.image || PRODUCT_IMAGE_FALLBACK;

  return (
    <div className={`product-card-${styleType} w-full`}>
      <div className="w-full h-[105px] bg-white border border-primarygray px-5 ">
        <div className="w-full h-full flex space-x-5 justify-center items-center">
          <div className="w-[75px] h-full relative">
            <Image
              fill
              sizes="100%"
              src={productImage}
              alt={datas.title || "Profesyonel berber ve kuafor urunu gorseli"}
              style={{ objectFit: "scale-down" }}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 h-full flex flex-col justify-center">
            <Link href={buildProductPath(datas.slug)}>
              <h3 className="title mb-2 sm:text-[15px] text-[13px] font-600 text-qblack leading-[24px] line-clamp-1 hover:text-qyellow cursor-pointer">
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
                      <span className="line-through text-qgray font-500 text-base mr-2">
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
        </div>
      </div>
    </div>
  );
}

export default RowV2;
