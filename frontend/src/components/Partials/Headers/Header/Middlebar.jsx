"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cart from "../../../Cart";
import Compair from "../../../Helpers/icons/Compair";
import ThinBag from "../../../Helpers/icons/ThinBag";
import ThinLove from "../../../Helpers/icons/ThinLove";
import ThinPeople from "../../../Helpers/icons/ThinPeople";
import SearchBox from "../../../Helpers/SearchBox";
import ServeLangItem from "../../../Helpers/ServeLangItem";
import auth from "@/utils/auth";
import appConfig from "@/appConfig";
import { setWishlistData } from "@/redux/features/whishlist/whishlistSlice";
import { useLazyLogoutApiQuery } from "@/redux/features/auth/apiSlice";
import { toast } from "react-toastify";
import { deleteCookie } from "cookies-next";

export default function Middlebar({ className, settings }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux selectors
  const { wishlistData } = useSelector((state) => state.wishlistData);
  const { compareProducts } = useSelector((state) => state.compareProducts);
  const { cart } = useSelector((state) => state.cart);

  // Local state
  const [profile, setProfile] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Derived values
  const wishlists = wishlistData?.wishlists;
  const compareProductsCount = compareProducts?.products?.length || 0;
  const wishlistCount = wishlists?.length || 0;
  const cartItemsCount = cartItems.length;

  // Update cart items when cart changes
  useEffect(() => {
    if (cart?.cartProducts) {
      setCartItems(cart.cartProducts);
    }
  }, [cart]);

  // Toggle profile dropdown
  const toggleProfile = () => {
    setProfile(!profile);
  };

  /**
   * Handles user logout functionality
   * @Initialization Logout Api @const logoutApi
   * @func logoutSuccessHandler @param data @param statusCode
   * @func logout
   */
  const [logoutApi, { isLoading: isLogoutLoading }] = useLazyLogoutApiQuery();

  const logoutSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      dispatch(setWishlistData(null));
      toast.success(data?.notification);
      localStorage.removeItem("auth");
      deleteCookie("access_token");
      router.push("/login");
    } else {
      // for force logout
      dispatch(setWishlistData(null));
      toast.success("Logout Successfully");
      localStorage.removeItem("auth");
      deleteCookie("access_token");
      router.push("/login");
    }
  };

  const logout = async () => {
    if (auth()) {
      await logoutApi({
        token: auth()?.access_token,
        success: logoutSuccessHandler,
      });
    }
  };

  return (
    <div className={`w-full h-[86px] bg-white ${className}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo Section */}
            <div className="relative">
              <Link href="/">
                {settings?.logo && (
                  <img
                    className="w-[153px] h-[44px] object-contain"
                    src={`${appConfig.BASE_URL}${settings.logo}`}
                    alt="logo"
                  />
                )}
              </Link>
            </div>

            {/* Search Box */}
            <div className="w-[517px] h-[44px]">
              <SearchBox className="search-com" />
            </div>

            {/* Right Side Icons & Profile */}
            <div className="flex space-x-6 rtl:space-x-reverse items-center relative">
              {/* Compare Products */}
              <div className="compaire relative">
                <Link href={auth() ? "/products-compaire" : "/login"}>
                  <span className="cursor-pointer">
                    <Compair className="fill-current" />
                  </span>
                </Link>
                <span className="w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px]">
                  {compareProductsCount}
                </span>
              </div>

              {/* Wishlist */}
              <div className="favorite relative">
                <Link href={auth() ? "/wishlist" : "/login"}>
                  <span className="cursor-pointer">
                    <ThinLove className="fill-current" />
                  </span>
                </Link>
                <span className="w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px]">
                  {wishlistCount}
                </span>
              </div>

              {/* Shopping Cart */}
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <Link href="/cart">
                    <span className="cursor-pointer">
                      <ThinBag />
                    </span>
                  </Link>
                  <span className="w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px]">
                    {cartItemsCount}
                  </span>
                </div>
                <Cart className="absolute ltr:-right-[45px] rtl:-left-[45px] top-11 z-50 hidden group-hover:block" />
              </div>

              {/* User Profile */}
              <div>
                {auth() ? (
                  <button onClick={toggleProfile} type="button">
                    <span className="text-qblack font-bold text-sm block">
                      {auth()?.user?.name}
                    </span>
                    <span className="text-qgray font-medium text-sm block">
                      {auth()?.user?.phone}
                    </span>
                  </button>
                ) : (
                  <Link href="/login">
                    <span className="cursor-pointer">
                      <ThinPeople />
                    </span>
                  </Link>
                )}
              </div>

              {/* Profile Dropdown */}
              {profile && (
                <>
                  {/* Backdrop */}
                  <div
                    onClick={() => setProfile(false)}
                    className="w-full h-full fixed top-0 left-0 z-30"
                    style={{ zIndex: "35", margin: "0" }}
                  ></div>

                  {/* Dropdown Menu */}
                  <div
                    className="w-[208px] h-[267px] bg-white absolute right-0 top-11 z-40 border-t-[3px] primary-border flex flex-col justify-between"
                    style={{
                      boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)",
                    }}
                  >
                    {/* Menu Items */}
                    <div className="menu-item-area w-full p-5">
                      <ul className="w-full flex flex-col space-y-7">
                        <li className="text-base text-qgraytwo">
                          <span>
                            {ServeLangItem()?.Hi}, {auth()?.user?.name}
                          </span>
                        </li>
                        <li className="text-base text-qgraytwo cursor-pointer hover:text-qblack hover:font-semibold">
                          <Link href="/profile#dashboard">
                            <span className="capitalize">
                              {ServeLangItem()?.profile}
                            </span>
                          </Link>
                        </li>
                        <li className="text-base text-qgraytwo cursor-pointer hover:text-qblack hover:font-semibold">
                          <Link href="/contact">
                            <span className="capitalize">
                              {ServeLangItem()?.Support}
                            </span>
                          </Link>
                        </li>
                        <li className="text-base text-qgraytwo cursor-pointer hover:text-qblack hover:font-semibold">
                          <Link href="/faq">
                            <span className="capitalize">
                              {ServeLangItem()?.FAQ}
                            </span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Logout Button */}
                    <div className="w-full h-10 flex justify-center items-center border-t border-qgray-border">
                      <button
                        onClick={logout}
                        type="button"
                        className="text-qblack text-base font-semibold"
                      >
                        {ServeLangItem()?.Sign_Out}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
