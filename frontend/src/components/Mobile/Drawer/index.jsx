import Link from "next/link";
import React, { useState } from "react";
import Compair from "../../Helpers/icons/Compair";
import ThinLove from "../../Helpers/icons/ThinLove";
import CloseButtonIcon from "../../Helpers/icons/CloseButtonIcon";
import SearchIcon from "../../Helpers/icons/SearchIcon";
import ArrowRightIcon from "../../Helpers/icons/ArrowRightIcon";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import FontAwesomeCom from "../../Helpers/icons/FontAwesomeCom";
import ServeLangItem from "../../Helpers/ServeLangItem";
import Multivendor from "../../Shared/Multivendor";

export default function Drawer({ className, open, action }) {
  const isMultivendor = Multivendor();
  const router = useRouter();
  const [tab, setTab] = useState("category");
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const categoryList = websiteSetup && websiteSetup.payload.productCategories;
  const customPages = websiteSetup && websiteSetup.payload.customPages;
  const { compareProducts } = useSelector((state) => state.compareProducts);
  const { wishlistData } = useSelector((state) => state.wishlistData);
  const wishlists = wishlistData && wishlistData.wishlists;
  const [searchKey, setSearchkey] = useState("");
  const searchHandler = () => {
    if (searchKey !== "") {
      router.push({
        pathname: "/search",
        query: { search: searchKey },
      });
    } else {
      return false;
    }
  };

  return (
    <div
      className={`drawer-wrapper w-full block lg:hidden h-full relative  ${
        className || ""
      }`}
    >
      {open && (
        <div
          onClick={action}
          className="w-full h-screen bg-black bg-opacity-40 z-40 left-0 top-0 fixed"
        ></div>
      )}
      <div
        className={`w-[280px] transition-all duration-300 ease-in-out h-screen overflow-y-auto overflow-x-hidden overflow-style-none bg-white fixed top-0 z-50 ${
          open ? "left-0" : "-left-[280px]"
        }`}
      >
        <div className="w-full px-5 mt-5 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-5 items-center">
              <div className="compare relative">
                <Link href="/products-compare" aria-label="Karşılaştır">
                  <span>
                    <Compair className="text-qblack fill-current" />
                  </span>
                </Link>
                <span className="w-[18px] h-[18px] rounded-full bg-qyellow absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px]">
                  {compareProducts ? compareProducts.length : 0}
                </span>
              </div>
              <div className="favorite relative">
                <Link href="/wishlist" aria-label="Favorilerim">
                  <span>
                    <ThinLove className="text-qblack fill-current" />
                  </span>
                </Link>
                <span className="w-[18px] h-[18px] rounded-full bg-qyellow absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px]">
                  {wishlists ? wishlists.length : 0}
                </span>
              </div>
            </div>
            <button onClick={action} type="button" aria-label="Menüyü kapat">
              <CloseButtonIcon />
            </button>
          </div>
        </div>
        <div className="w-full mt-5 px-5">
          <div className="search-bar w-full h-[34px]  flex ">
            <div className="flex-1 bg-white h-full border border-r-0 border-[#E9E9E9]">
              <input
                value={searchKey}
                onChange={(e) => setSearchkey(e.target.value)}
                type="text"
                className="w-full text-xs h-full focus:outline-none foucus:ring-0 placeholder:text-qgraytwo pl-2.5 "
                placeholder="Urun ara..."
              />
            </div>
            <div
              onClick={searchHandler}
              className="cursor-pointer w-[40px] h-full bg-qyellow flex justify-center items-center"
            >
              <span>
                <SearchIcon />
              </span>
            </div>
          </div>
        </div>
        <div className="w-full mt-5 px-5 flex items-center space-x-3">
          <span
            onClick={() => setTab("category")}
            className={`text-base font-semibold  ${
              tab === "category" ? "text-qblack" : "text-qgray"
            }`}
          >
            {ServeLangItem()?.Categories}
          </span>
          <span className="w-[1px] h-[14px] bg-qgray"></span>
          <span
            onClick={() => setTab("menu")}
            className={`text-base font-semibold ${
              tab === "menu" ? "text-qblack" : "text-qgray "
            }`}
          >
            {ServeLangItem()?.Main_Menu}
          </span>
        </div>
        {tab === "category" ? (
          <div className="category-item mt-5 w-full">
            <ul className="categories-list">
              {categoryList &&
                categoryList.map((item, i) => (
                  <li key={i} className="category-item">
                    <Link
                      href={{
                        pathname: "/products",
                        query: { category: item.slug },
                      }}
                    >
                      <div className=" flex justify-between items-center px-5 h-12 bg-white hover-bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                        <div className="flex items-center space-x-6">
                          <span>
                            <span>
                              <FontAwesomeCom
                                className="w-4 h-4"
                                icon={item.icon}
                              />
                            </span>
                          </span>
                          <span className="text-sm font-400 capitalize">
                            {item.name}
                          </span>
                        </div>
                        <div>
                          <span>
                            <ArrowRightIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
            {isMultivendor && isMultivendor === 1 ? (
              <div className="block my-5 px-2">
                <Link href="/become-seller">
                  <div className="text-sm leading-6 text-qblack w-full h-10 flex justify-center items-center bg-qyellow font-medium font-500 cursor-pointer">
                    <span>{ServeLangItem()?.Become_seller}</span>
                  </div>
                </Link>
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          <div className="menu-item mt-5 w-full">
            <ul className="categories-list">
              <li className="category-item">
                <Link href="#">
                  <div className=" flex justify-between items-center px-5 h-12 bg-white hover-bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-400 capitalize">
                        {ServeLangItem()?.Pages}
                      </span>
                    </div>
                    <div>
                      <span>
                        <ArrowRightIcon />
                      </span>
                    </div>
                  </div>
                </Link>
                <ul className="submenu-list ml-5">
                  <li className="category-item">
                    <Link href="/privacy-policy">
                      <div className=" flex justify-between items-center px-5 h-12 bg-white hover-bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                        <div className="flex items-center space-x-6">
                          <span className="text-sm font-400 capitalize">
                            {ServeLangItem()?.Privacy_Policy}
                          </span>
                        </div>
                        <div>
                          <span>
                            <ArrowRightIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="category-item">
                    <Link href="/faq">
                      <div className=" flex justify-between items-center px-5 h-12 bg-white hover-bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                        <div className="flex items-center space-x-6">
                          <span className="text-sm font-400 capitalize">
                            {ServeLangItem()?.FAQ}
                          </span>
                        </div>
                        <div>
                          <span>
                            <ArrowRightIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="category-item">
                    <Link href="/terms-condition">
                      <div className=" flex justify-between items-center px-5 h-12 bg-white hover-bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                        <div className="flex items-center space-x-6">
                          <span className="text-sm font-400 capitalize">
                            {ServeLangItem()?.Term_and_Conditions}
                          </span>
                        </div>
                        <div>
                          <span>
                            <ArrowRightIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="category-item">
                    <Link href="/seller-terms-condition">
                      <div className=" flex justify-between items-center px-5 h-12 bg-white hover:bg-qgreen transition-all duration-300 ease-in-out cursor-pointer">
                        <div className="flex items-center space-x-6">
                          <span className="text-sm font-400 capitalize ">
                            {ServeLangItem()?.Seller_terms_and_conditions}
                          </span>
                        </div>
                        <div>
                          <span>
                            <ArrowRightIcon />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                  {customPages &&
                    customPages.length > 0 &&
                    customPages.map((item, i) => (
                      // eslint-disable-next-line react/jsx-key
                      <React.Fragment key={i}>
                        <li className="category-item">
                          <Link href={`/${item.slug}`} passHref>
                            <div className=" flex justify-between items-center px-5 h-12 bg-white hover-bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                              <div className="flex items-center space-x-6">
                                <span className="text-sm font-400 capitalize ">
                                  {item.page_name}
                                </span>
                              </div>
                              <div>
                                <span>
                                  <ArrowRightIcon />
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      </React.Fragment>
                    ))}
                </ul>
              </li>

            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
