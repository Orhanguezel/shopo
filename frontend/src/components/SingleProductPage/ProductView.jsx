"use client";
import Image from "next/image";
import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { buildProductPath } from "@/utils/url";
import { toast } from "react-toastify";
import auth from "../../utils/auth";
import settings from "../../utils/settings";
import { addItem } from "../../redux/features/cart/cartSlice";
import useWishlist from "../../hooks/useWishlist";
import Star from "../Helpers/icons/Star";
import ThinLove from "../Helpers/icons/ThinLove";
import Selectbox from "../Helpers/Selectbox";
import CheckProductIsExistsInFlashSale from "../Shared/CheckProductIsExistsInFlashSale";
import ServeLangItem from "../Helpers/ServeLangItem";
import LoginContext from "../Contexts/LoginContext";
import messageContext from "../Contexts/MessageContext";
import CurrencyConvert from "../Shared/CurrencyConvert";
import ReportIco from "../Helpers/icons/ReportIco";
import FbIco from "../Helpers/icons/FbIco";
import TwiterIco from "../Helpers/icons/TwiterIco";
import MessageIco from "../Helpers/icons/MessageIco";
import { useFlyingCart } from "../Contexts/FlyingCartContext";
import appConfig from "@/appConfig";

const PRODUCT_IMAGE_FALLBACK = "/assets/images/server-error.png";

const parseAmount = (value) => {
  const parsedValue = parseInt(value, 10);
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

const getInitialVariantItems = (variants = []) => {
  return variants
    .map((variant) => variant?.active_variant_items?.[0] || null)
    .filter(Boolean);
};

const calculateVariantPricing = (product, selectedVariantItems = []) => {
  const basePrice = parseAmount(product?.price);
  const baseOfferPrice = product?.offer_price
    ? parseAmount(product.offer_price)
    : null;
  const variantTotal = selectedVariantItems.reduce(
    (total, item) => total + parseAmount(item?.price),
    0
  );

  return {
    price: basePrice + variantTotal,
    offerPrice:
      baseOfferPrice !== null ? baseOfferPrice + variantTotal : null,
  };
};

const StarRating = ({ rating }) => {
  const numericRating = isNaN(parseInt(rating)) ? 0 : Math.min(5, Math.max(0, parseInt(rating)));
  return (
    <div className="flex">
      {Array.from(Array(numericRating), (_, i) => (
        <span key={`star-filled-${i}`}>
          <Star />
        </span>
      ))}
      {numericRating < 5 && (
        <>
          {Array.from(Array(5 - numericRating), (_, i) => (
            <span
              key={`star-empty-${i}`}
              className="text-gray-500"
            >
              <Star defaultValue={false} />
            </span>
          ))}
        </>
      )}
    </div>
  );
};

const ProductImage = ({ src, alt, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer relative ${
      onClick ? "" : "cursor-default"
    }`}
  >
    <Image
      fill
      style={{ objectFit: "scale-down" }}
      src={src ? `${appConfig.BASE_URL + src}` : PRODUCT_IMAGE_FALLBACK}
      alt={alt}
      className={`w-full h-full object-contain transform scale-110 ${className}`}
    />
  </div>
);

const QuantitySelector = ({ quantity, onIncrement, onDecrement }) => (
  <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
    <div className="flex justify-between items-center w-full">
      <button
        onClick={onDecrement}
        type="button"
        className="text-base text-qgray"
      >
        -
      </button>
      <span className="text-qblack">{quantity}</span>
      <button
        onClick={onIncrement}
        type="button"
        className="text-base text-qgray"
      >
        +
      </button>
    </div>
  </div>
);

const VariantSelector = ({ variants, onSelectVariant }) => {
  return (
    <>
      {variants.length > 0 &&
        variants.map((item, i) => (
          <div key={i}>
            {Array.isArray(item?.active_variant_items) &&
              item.active_variant_items.length > 0 && (
              <div className="w-full mb-5">
                <div className="border border-qgray-border h-[50px] flex justify-between items-center cursor-pointer">
                  <Selectbox
                    action={onSelectVariant}
                    className="w-full px-5"
                    datas={item.active_variant_items}
                  >
                    {({ item }) => (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[13px] text-qblack">{item}</span>
                        <span>
                          <svg
                            width="11"
                            height="7"
                            viewBox="0 0 11 7"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                              fill="#222222"
                            />
                          </svg>
                        </span>
                      </div>
                    )}
                  </Selectbox>
                </div>
              </div>
            )}
          </div>
        ))}
    </>
  );
};

const SocialShareButtons = ({ product }) => {
  const safeProduct = product || {};
  const shareUrl =
    typeof window !== "undefined" && window.location.origin
      ? `${window.location.origin}${buildProductPath(safeProduct.slug || "")}`
      : "";

  return (
    <div className="flex space-x-5 items-center">
      <FacebookShareButton url={shareUrl} quotes={safeProduct.name || ""}>
        <span className="cursor-pointer">
          <FbIco />
        </span>
      </FacebookShareButton>
      <TwitterShareButton url={shareUrl} title={safeProduct.name || ""}>
        <span className="cursor-pointer">
          <TwiterIco />
        </span>
      </TwitterShareButton>
    </div>
  );
};

export default function ProductView({
  className,
  reportHandler,
  images = [],
  product,
  details,
  seller,
}) {
  const safeProduct = product || {};
  const safeDetails = details || {};
  const safeVariants = safeProduct?.active_variants || [];
  const safeImages = Array.isArray(images) ? images : [];

  // Redux and Context
  const { cart } = useSelector((state) => state.cart);
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const dispatch = useDispatch();
  const messageHandler = useContext(messageContext);
  const loginPopupBoard = useContext(LoginContext);
  // Custom hooks
  const {
    wishlisted,
    arWishlist,
    addToWishlist,
    removeToWishlist,
    addToWishlistLoading,
    removeFromWishlistLoading,
  } = useWishlist(product);
  const { triggerFlyingCart } = useFlyingCart();

  // State Management
  const [more, setMore] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [src, setSrc] = useState(safeProduct?.thumb_image || "");
  const [price, setPrice] = useState(null);
  const [offerPrice, setOffer] = useState(null);
  const [pricePercent, setPricePercent] = useState("");

  const [varients, setVarients] = useState(safeVariants);
  const [selectedVariantItems, setSelectedVariantItems] = useState(
    getInitialVariantItems(safeVariants)
  );

  // State Management
  const [productsImg, setProductsImg] = useState(safeImages);

  const tags = useMemo(() => {
    if (!safeProduct?.tags) return [];
    try {
      const parsedTags =
        typeof safeProduct.tags === "string"
        ? JSON.parse(safeProduct.tags)
        : safeProduct.tags;
      return Array.isArray(parsedTags) ? parsedTags : [];
    } catch (e) {
      return [];
    }
  }, [safeProduct?.tags]);

  const { map_status, commission_type } = settings();
  const reviewCount = parseInt(
    safeDetails?.totalProductReviewQty ||
      safeDetails?.productReviews?.length ||
      0,
    10
  );
  const averageRating = parseFloat(safeProduct?.averageRating || 0);
  const sellerProductCount = parseInt(safeDetails?.sellerTotalProducts || 0, 10);
  const sellerReviewCount = parseInt(safeDetails?.sellerTotalReview || 0, 10);

  // Update state when props change - improved synchronization
  useEffect(() => {
    const nextVariants = safeVariants;
    const initialVariants = getInitialVariantItems(nextVariants);

    setVarients(nextVariants);
    setSelectedVariantItems(initialVariants);
    setSrc(safeProduct?.thumb_image || "");
    setQuantity(1);
  }, [safeProduct?.id, safeProduct?.thumb_image, safeVariants]);

  useEffect(() => {
    setProductsImg(safeImages);
  }, [safeImages]);

  useEffect(() => {
    const pricing = calculateVariantPricing(safeProduct, selectedVariantItems);
    setPrice(pricing.price);
    setOffer(pricing.offerPrice);
  }, [safeProduct, selectedVariantItems]);

  // Memoized Values
  const isFlashSaleProduct = useMemo(() => {
    if (!websiteSetup?.payload?.flashSaleProducts || !safeProduct?.id) {
      return false;
    }

    const flashSaleProducts = websiteSetup.payload.flashSaleProducts;
    return flashSaleProducts.find(
      (item) => parseInt(item.product_id, 10) === parseInt(safeProduct.id, 10)
    );
  }, [websiteSetup, safeProduct?.id]);

  // Event Handlers
  const changeImgHandler = useCallback((current) => {
    setSrc(current);
  }, []);

  const increment = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  const selectVarient = useCallback(
    (value) => {
      if (!value || !varients?.length) {
        return;
      }

      if (value.image) {
        changeImgHandler(value.image);
      }

      setSelectedVariantItems((previousItems) => {
        const baselineItems = previousItems.length
          ? previousItems
          : getInitialVariantItems(varients);

        return baselineItems.map((item) => {
          if (
            parseInt(item?.product_variant_id, 10) ===
            parseInt(value?.product_variant_id, 10)
          ) {
            return value;
          }
          return item;
        });
      });
    },
    [varients, changeImgHandler]
  );

  const addToCard = useCallback(
    (id, event) => {
      if (!safeProduct?.id) {
        toast.error("Urun bulunamadi.");
        return;
      }

      const vendor_id = safeProduct?.vendor_id;
      const parentVarients =
        selectedVariantItems?.length > 0
          ? selectedVariantItems.map((v) => {
              const variantObj = varients.find(
                (item) => Number(item.id) === Number(v.product_variant_id)
              );
              return {
                ...v,
                product_variant_name: variantObj ? variantObj.name : "Varyant",
              };
            })
          : [];

      const productShort = {
        product_id: id,
        qty: quantity,
        product: {
          id: id,
          vendor_id: vendor_id,
          name: safeProduct?.name,
          price: safeProduct?.price,
          offer_price: safeProduct?.offer_price,
          thumb_image: safeProduct?.thumb_image,
          slug: safeProduct?.slug,
        },
        variants: parentVarients?.length
          ? parentVarients.map((item) => ({
              variant_id: Number(item.product_variant_id),
              variant_item_id: item.id,
              product_id: id,
              variant_item: {
                id: item.id,
                product_variant_name: item.product_variant_name,
                name: item.name,
                price: item.price,
              },
            }))
          : [],
      };

      if (cart) {
        const checkProduct = cart?.cartProducts.length
          ? cart?.cartProducts.find((item) => item.product_id === id)
          : null;
        const vendorProduct = cart?.cartProducts.length
          ? cart?.cartProducts.find(
              (item) => item.product.vendor_id === vendor_id
            )
          : null;
        const enableMapOrCommission =
          (map_status && Number(map_status) === 1) ||
          (commission_type && commission_type === "subscription");

        if (enableMapOrCommission) {
          if (!vendorProduct) {
            if (checkProduct) {
              toast.error("Urun zaten sepette.");
            } else {
              dispatch(addItem(productShort));
              // Trigger flying cart animation
              triggerFlyingCartAnimation(event);
            }
          } else {
            toast.error(
              "You cannot add another product from the same vendor to the cart."
            );
          }
        } else {
          if (checkProduct) {
            toast.error("Urun zaten sepette.");
          } else {
            dispatch(addItem(productShort));
            // Trigger flying cart animation
            triggerFlyingCartAnimation(event);
          }
        }
      }
    },
    [
      cart,
      safeProduct,
      selectedVariantItems,
      varients,
      quantity,
      map_status,
      commission_type,
      dispatch,
    ]
  );

  /**
   * Trigger flying cart animation
   * Gets the position of the product card and fixed cart button to animate
   */
  const triggerFlyingCartAnimation = useCallback(
    (event) => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const fixedCartButton = document.querySelector(".fixed-cart-wrapper");

        if (fixedCartButton) {
          const cartRect = fixedCartButton.getBoundingClientRect();

          // Use the exact click position from the event
          const startPosition = {
            x: event ? event.clientX : 0,
            y: event ? event.clientY : 0,
          };

          const endPosition = {
            x: cartRect.left + cartRect.width / 2,
            y: cartRect.top + cartRect.height / 2,
          };

          triggerFlyingCart(
            safeProduct?.thumb_image?.replace(appConfig.BASE_URL, ""),
            startPosition,
            endPosition
          );
        }
      }, 100);
    },
    [triggerFlyingCart, safeProduct?.thumb_image]
  );

  const popupMessageHandler = useCallback(() => {
    if (auth()) {
      messageHandler.toggleHandler(seller);
    } else {
      loginPopupBoard.handlerPopup(true);
    }
  }, [messageHandler, seller, loginPopupBoard]);

  useEffect(() => {
    if (websiteSetup && safeProduct?.price) {
      if (isFlashSaleProduct) {
        const offerFlashSale = websiteSetup.payload?.flashSale;
        const offer = parseAmount(offerFlashSale?.offer || 0);
        const basePrice = parseAmount(safeProduct?.price || 0);
        if (basePrice > 0) {
          const effectivePrice = safeProduct?.offer_price
            ? parseAmount(safeProduct.offer_price)
            : basePrice;
          const discountPrice = (offer / 100) * effectivePrice;
          const mainPrice = effectivePrice - discountPrice;
          setPricePercent(
            Math.trunc(((mainPrice - basePrice) / basePrice) * 100)
          );
        }
      } else {
        const basePrice = parseAmount(safeProduct?.price || 0);
        if (basePrice > 0 && safeProduct?.offer_price) {
          setPricePercent(
            Math.trunc(
              ((parseAmount(safeProduct.offer_price) - basePrice) / basePrice) *
                100
            )
          );
        } else {
          setPricePercent("");
        }
      }
    } else {
      setPricePercent("");
    }
  }, [websiteSetup, isFlashSaleProduct, safeProduct]);

  if (!safeProduct?.id) {
    return (
      <div className={`product-view w-full ${className || ""}`}>
        <div className="w-full rounded border border-qgray-border p-8 text-center text-qgray">
          Urun detaylari su anda goruntulenemiyor.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`product-view w-full lg:flex justify-between ${
        className || ""
      }`}
    >
      {/* Product Images Section */}
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full md:h-[600px] h-[350px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3">
            <Image
              fill
              style={{ objectFit: "scale-down" }}
              src={src ? `${appConfig.BASE_URL + src}` : PRODUCT_IMAGE_FALLBACK}
              alt={product?.name || "Urun gorseli"}
              className="object-contain transform scale-110"
            />
            {safeProduct?.offer_price && (
              <div className="w-[80px] h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px]">
                <span className="text-tblack">{pricePercent}%</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <ProductImage
              src={safeProduct?.thumb_image}
              alt=""
              className={src !== safeProduct?.thumb_image ? "opacity-50" : ""}
              onClick={() => changeImgHandler(safeProduct?.thumb_image || "")}
            />
            {productsImg &&
              productsImg.length > 0 &&
              productsImg.map((img, i) => (
                <ProductImage
                  key={i}
                  src={img.image}
                  alt=""
                  className={src !== img.image ? "opacity-50" : ""}
                  onClick={() => changeImgHandler(img.image)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          {/* Brand */}
          {safeProduct?.brand && (
            <span
              data-aos="fade-up"
              className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block"
            >
              {safeProduct?.brand?.name}
            </span>
          )}

          {/* Product Name */}
          <h1
            data-aos="fade-up"
            className="text-xl font-medium text-qblack mb-4 notranslate"
          >
            {safeProduct?.name}
          </h1>

          {/* Rating */}
          <div
            data-aos="fade-up"
            className="flex space-x-[10px] items-center mb-6"
          >
            <StarRating rating={safeProduct?.averageRating} />
            <span className="text-[13px] font-normal text-qblack">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} puan
            </span>
            <span className="text-[13px] text-qgray">
              ({reviewCount} degerlendirme)
            </span>
          </div>

          {/* Müşteri puanı/Satıcı ölçeği/Alışveriş sinyali — kaldırıldı (#6) */}

          {/* Price — belirgin UI (#8) */}
          <div
            data-aos="fade-up"
            className="flex items-baseline gap-3 mb-7 p-4 bg-gradient-to-r from-[#fff5f5] to-[#fff0f0] rounded-xl border border-[#ffe0e0]"
          >
              <span
                suppressHydrationWarning
                className={`main-price font-700 ${
                offerPrice
                  ? "line-through text-qgray text-[16px]"
                  : "text-qred text-[28px]"
              }`}
            >
              {offerPrice ? (
                <CurrencyConvert price={price} />
              ) : (
                <CheckProductIsExistsInFlashSale
                  id={safeProduct.id}
                  price={price}
                />
              )}
            </span>
            {offerPrice && (
              <span
                suppressHydrationWarning
                className="offer-price text-qred font-700 text-[28px]"
              >
                <CheckProductIsExistsInFlashSale
                  id={safeProduct.id}
                  price={offerPrice}
                />
              </span>
            )}
          </div>

          {/* Description */}
          <div data-aos="fade-up" className="mb-[30px]">
            <div
              className={`text-qgray text-sm text-normal leading-7 ${
                more ? "" : "line-clamp-2"
              }`}
            >
              {safeProduct?.short_description || ""}
            </div>
            <button
              onClick={() => setMore(!more)}
              type="button"
              className="text-blue-500 text-xs font-bold"
            >
              {more ? "Daha az goster" : "Devamini goster"}
            </button>
          </div>

          {/* Availability — gizlendi (#5) */}

          {/* Variants */}
          <VariantSelector
            variants={varients || []}
            onSelectVariant={selectVarient}
          />

          {/* Quantity and Wishlist */}
          <div
            data-aos="fade-up"
            className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]"
          >
            <QuantitySelector
              quantity={quantity}
              onIncrement={increment}
              onDecrement={decrement}
            />
            <div className="w-[60px] h-full flex justify-center items-center border border-qgray-border">
              {!arWishlist ? (
                <button
                  disabled={addToWishlistLoading}
                  type="button"
                  onClick={() => addToWishlist(safeProduct.id)}
                >
                  <span className="w-10 h-10 flex justify-center items-center">
                    <ThinLove className="fill-current" />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeToWishlist(wishlisted?.id)}
                  disabled={removeFromWishlistLoading}
                >
                  <span className="w-10 h-10 flex justify-center items-center">
                    <ThinLove fill={true} />
                  </span>
                </button>
              )}
            </div>
            {/* Add to Cart Button */}
            <div className="flex-1 h-full">
              <button
                onClick={(e) => addToCard(safeProduct.id, e)}
                type="button"
                className="black-btn text-sm font-semibold w-full h-full"
              >
                {ServeLangItem()?.Add_To_Cart}
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div data-aos="fade-up" className="mb-[20px]">
          <p className="text-[13px] text-qgray leading-7">
            <span className="text-qblack">Kategori:</span>{" "}
            {safeProduct?.category?.name || ""}
          </p>
          {tags.length > 0 && (
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Etiketler:</span>{" "}
              {tags.map((item, i) => (
                <span key={i}>
                  {(item?.value || item?.name || item || "") +
                    (i < tags.length - 1 ? ", " : "")}
                </span>
              ))}
            </p>
          )}
          <p className="text-[13px] text-qgray leading-7">
            <span className="text-qblack uppercase">
              {ServeLangItem()?.SKU}:
            </span>{" "}
            {safeProduct?.sku || ""}
          </p>
        </div>

        {/* Report Button */}
        <div
          data-aos="fade-up"
          className="flex space-x-2 items-center mb-[20px] report-btn"
        >
          <span>
            <ReportIco />
          </span>
          <button
            type="button"
            onClick={reportHandler}
            className="text-qred font-semibold text-[13px]"
          >
            {ServeLangItem()?.Report_This_Item}
          </button>
        </div>

        {/* Social Share */}
        <div
          data-aos="fade-up"
          className="social-share flex items-center w-full mb-[20px]"
        >
          <span className="text-qblack text-[13px] mr-[17px] inline-block">
            {ServeLangItem()?.Share_This}
          </span>
          <SocialShareButtons product={safeProduct} />
        </div>

        {/* Satıcıya mesaj — müşteri-satıcı mesajlaşma kaldırıldı (#35) */}
      </div>
    </div>
  );
}
