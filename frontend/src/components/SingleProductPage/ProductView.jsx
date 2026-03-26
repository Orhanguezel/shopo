"use client";
import Image from "next/image";
import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FacebookShareButton, TwitterShareButton } from "react-share";
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

const StarRating = ({ rating }) => (
  <div className="flex">
    {Array.from(Array(parseInt(rating)), () => (
      <span key={parseInt(rating) + Math.random()}>
        <Star />
      </span>
    ))}
    {parseInt(rating) < 5 && (
      <>
        {Array.from(Array(5 - parseInt(rating)), () => (
          <span
            key={parseInt(rating) + Math.random()}
            className="text-gray-500"
          >
            <Star defaultValue={false} />
          </span>
        ))}
      </>
    )}
  </div>
);

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
      src={`${appConfig.BASE_URL + src}`}
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
            {item.active_variant_items.length > 0 && (
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
  const shareUrl =
    typeof window !== "undefined" && window.location.origin
      ? `${window.location.origin}/single-product?slug=${product.slug}`
      : "";

  return (
    <div className="flex space-x-5 items-center">
      <FacebookShareButton url={shareUrl} quotes={product.name}>
        <span className="cursor-pointer">
          <FbIco />
        </span>
      </FacebookShareButton>
      <TwitterShareButton url={shareUrl} title={product.name}>
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
  seller,
}) {
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
  const [src, setSrc] = useState(product.thumb_image);
  const [price, setPrice] = useState(null);
  const [offerPrice, setOffer] = useState(null);
  const [pricePercent, setPricePercent] = useState("");

  // Initialize variants state properly
  const [varients, setVarients] = useState(product?.active_variants || []);

  const [getFirstVarients, setFirstVarients] = useState([]);

  // State Management
  const [productsImg, setProductsImg] = useState(
    images && images.length > 0 ? images : []
  );
  const tags = product && JSON.parse(product.tags);
  const { map_status, commission_type } = settings();

  // Update state when props change - improved synchronization
  useEffect(() => {
    if (product?.active_variants && product.active_variants.length > 0) {
      const initialVariants = product.active_variants
        .map((v) =>
          v.active_variant_items.length > 0 ? v.active_variant_items[0] : {}
        )
        .filter((v) => Object.keys(v).length > 0);

      setVarients(product.active_variants);
      setFirstVarients(initialVariants);

      // Also set initial prices when variants are available
      if (initialVariants.length > 0) {
        const prices = initialVariants.map((v) =>
          v.price ? parseInt(v.price) : 0
        );
        if (prices.length > 0) {
          const sumPrice =
            prices.reduce((prev, curr) => prev + curr, 0) +
            parseInt(product.price || 0);
          setPrice(sumPrice);
          if (product.offer_price) {
            const sumOfferPrice =
              prices.reduce((prev, curr) => prev + curr, 0) +
              parseInt(product.offer_price);
            setOffer(sumOfferPrice);
          }
        }
      }
    } else {
      setVarients([]);
      setFirstVarients([]);

      // Set base product prices when no variants
      setPrice(product?.price);
      setOffer(product?.offer_price);
    }
  }, [product]);

  useEffect(() => {
    setProductsImg(images && images.length > 0 ? images : []);
  }, [images]);

  // Memoized Values
  const isFlashSaleProduct = useMemo(() => {
    if (!websiteSetup) return false;
    const flashSaleProducts = websiteSetup.payload.flashSaleProducts;
    return flashSaleProducts.find(
      (item) => parseInt(item.product_id) === product.id
    );
  }, [websiteSetup, product.id]);

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
      if (!value || !varients || !getFirstVarients) {
        return;
      }

      if (value.image) {
        changeImgHandler(value.image);
      }

      if (varients?.length && getFirstVarients?.length) {
        const replacePrice = getFirstVarients.map((v) => {
          if (
            parseInt(v.product_variant_id) ===
            parseInt(value.product_variant_id)
          ) {
            return value;
          }
          return v;
        });

        setFirstVarients(replacePrice);

        // Update prices when variant changes
        if (replacePrice.length > 0) {
          const prices = replacePrice.map((v) =>
            v.price ? parseInt(v.price) : 0
          );
          if (prices.length > 0) {
            const sumPrice =
              prices.reduce((prev, curr) => prev + curr, 0) +
              parseInt(product.price || 0);
            setPrice(sumPrice);
            if (product.offer_price) {
              const sumOfferPrice =
                prices.reduce((prev, curr) => prev + curr, 0) +
                parseInt(product.offer_price);
              setOffer(sumOfferPrice);
            }
          }
        }
      }
    },
    [varients, getFirstVarients, changeImgHandler, product]
  );

  const addToCard = useCallback(
    (id, event) => {
      const vendor_id = product?.vendor_id;
      const parentVarients =
        getFirstVarients?.length > 0
          ? getFirstVarients.map((v) => ({
              ...v,
              product_variant_name: varients.find(
                (item) => Number(item.id) === Number(v.product_variant_id)
              ).name,
            }))
          : null;

      const productShort = {
        product_id: id,
        qty: quantity,
        product: {
          id: id,
          vendor_id: vendor_id,
          name: product?.name,
          price: product?.price,
          offer_price: product?.offer_price,
          thumb_image: product?.thumb_image,
          slug: product?.slug,
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
              toast.error("Product already in cart");
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
            toast.error("Product already in cart");
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
      product,
      getFirstVarients,
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
            product.thumb_image?.replace(appConfig.BASE_URL, ""),
            startPosition,
            endPosition
          );
        }
      }, 100);
    },
    [triggerFlyingCart, product.thumb_image]
  );

  const popupMessageHandler = useCallback(() => {
    if (auth()) {
      messageHandler.toggleHandler(seller);
    } else {
      loginPopupBoard.handlerPopup(true);
    }
  }, [messageHandler, seller, loginPopupBoard]);

  // Effects
  useEffect(() => {
    setSrc(product.thumb_image);
  }, [product]);

  useEffect(() => {
    if (varients && getFirstVarients && getFirstVarients.length > 0) {
      const prices =
        getFirstVarients?.map((v) => (v.price ? v.price : 0)) || [];

      // Ensure prices array has values before using reduce
      if (prices.length > 0) {
        const sumPrice = parseInt(
          prices.reduce((prev, curr) => parseInt(prev) + parseInt(curr), 0) +
            parseInt(product.price)
        );
        setPrice(sumPrice);
        if (product.offer_price) {
          const sumOfferPrice = parseInt(
            prices.reduce((prev, curr) => parseInt(prev) + parseInt(curr), 0) +
              parseInt(product.offer_price)
          );
          setOffer(sumOfferPrice);
        } else {
          setOffer(null);
        }
      } else {
        // No variant prices, use base product prices
        setPrice(product?.price);
        setOffer(product?.offer_price);
      }
    }
  }, [getFirstVarients, varients, product]);

  useEffect(() => {
    if (varients && varients.length > 0) {
      const prices = varients.map((v) =>
        v.active_variant_items.length > 0 && v.active_variant_items[0].price
          ? parseInt(v.active_variant_items[0].price)
          : 0
      );

      // Ensure prices array has values and add initial value to reduce
      if (prices.length > 0) {
        if (product.offer_price) {
          const sumCalc = prices.reduce(
            (prev, curr) => parseInt(prev) + parseInt(curr),
            0
          );
          const sumPrice = parseInt(sumCalc) + parseInt(product.price);
          const sumOfferPrice =
            parseInt(sumCalc) + parseInt(product.offer_price);
          setPrice(sumPrice);
          setOffer(sumOfferPrice);
        } else {
          const sumCalc = prices.reduce(
            (prev, curr) => parseInt(prev) + parseInt(curr),
            0
          );
          const sumPrice = parseInt(sumCalc) + parseInt(product.price);
          setPrice(sumPrice);
          setOffer(null);
        }
      } else {
        // No variant prices, use base product prices
        setPrice(product?.price);
        setOffer(product?.offer_price);
      }
    } else {
      setPrice(product?.price);
      setOffer(product?.offer_price);
    }
  }, [product, varients]);

  useEffect(() => {
    if (websiteSetup) {
      if (isFlashSaleProduct) {
        const offerFlashSale = websiteSetup.payload.flashSale;
        const offer = parseInt(offerFlashSale.offer);
        const price = product.offer_price
          ? parseInt(product.offer_price)
          : parseInt(product.price);
        const discountPrice = (offer / 100) * price;
        const mainPrice = price - discountPrice;
        setPricePercent(
          Math.trunc(((mainPrice - product.price) / product.price) * 100)
        );
      } else {
        setPricePercent(
          Math.trunc(
            ((product.offer_price - product.price) / product.price) * 100
          )
        );
      }
    }
  }, [websiteSetup, isFlashSaleProduct, product]);

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
              src={`${appConfig.BASE_URL + src}`}
              alt=""
              className="object-contain transform scale-110"
            />
            {product.offer_price && (
              <div className="w-[80px] h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px]">
                <span className="text-tblack">{pricePercent}%</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <ProductImage
              src={product.thumb_image}
              alt=""
              className={src !== product.thumb_image ? "opacity-50" : ""}
              onClick={() => changeImgHandler(product.thumb_image)}
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
          {product.brand && (
            <span
              data-aos="fade-up"
              className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block"
            >
              {product.brand.name}
            </span>
          )}

          {/* Product Name */}
          <p
            data-aos="fade-up"
            className="text-xl font-medium text-qblack mb-4 notranslate"
          >
            {product.name}
          </p>

          {/* Rating */}
          <div
            data-aos="fade-up"
            className="flex space-x-[10px] items-center mb-6"
          >
            <StarRating rating={product.averageRating} />
            <span className="text-[13px] font-normal text-qblack">
              {parseInt(product.averageRating)} {ServeLangItem()?.Reviews}
            </span>
          </div>

          {/* Price */}
          <div
            data-aos="fade-up"
            className="flex space-x-2 items-baseline mb-7"
          >
            <span
              suppressHydrationWarning
              className={`main-price font-600 ${
                offerPrice
                  ? "line-through text-qgray text-[15px]"
                  : "text-qred text-[24px]"
              }`}
            >
              {offerPrice ? (
                <CurrencyConvert price={price} />
              ) : (
                <CheckProductIsExistsInFlashSale
                  id={product.id}
                  price={price}
                />
              )}
            </span>
            {offerPrice && (
              <span
                suppressHydrationWarning
                className="offer-price text-qred font-600 text-[24px] ml-2"
              >
                <CheckProductIsExistsInFlashSale
                  id={product.id}
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
              {product.short_description}
            </div>
            <button
              onClick={() => setMore(!more)}
              type="button"
              className="text-blue-500 text-xs font-bold"
            >
              {more ? "See Less" : "See More"}
            </button>
          </div>

          {/* Availability */}
          <div className="p-3 bg-qyellowlow/10 flex items-center space-x-2 mb-[30px] w-fit">
            <span className="text-base font-bold text-qblack">
              {ServeLangItem()?.Availability} :
            </span>
            <span className="text-base font-bold text-qyellow">
              {product.qty !== "0"
                ? `${product.qty} Products Available`
                : `Products not Available`}
            </span>
          </div>

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
                  onClick={() => addToWishlist(product.id)}
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
                onClick={(e) => addToCard(product.id, e)}
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
            <span className="text-qblack">Category :</span>{" "}
            {product.category.name}
          </p>
          {tags && (
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Tags:</span>{" "}
              {tags.length > 0 &&
                tags.map((item, i) => <span key={i}>{item.value + ", "}</span>)}
            </p>
          )}
          <p className="text-[13px] text-qgray leading-7">
            <span className="text-qblack uppercase">
              {ServeLangItem()?.SKU}:
            </span>{" "}
            {product.sku}
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
          <SocialShareButtons product={product} />
        </div>

        {/* Chat with Seller */}
        {seller && (
          <div data-aos="fade-up" className="message-btn">
            <button
              onClick={popupMessageHandler}
              className="flex px-5 py-2 bg-qyellow text-qblack items-center space-x-2.5"
              type="button"
            >
              <span>
                <MessageIco />
              </span>
              <span className="text-base font-medium text-qblack capitalize">
                Chat with seller
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
