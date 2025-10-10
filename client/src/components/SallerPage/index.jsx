// src/components/SallerPage/index.jsx
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import productDatas from "../../data/products.json";
import ProductCardStyleOne from "@/components/Helpers/Cards/ProductCardStyleOne";
import DataIteration from "@/components/Helpers/DataIteration";
import Star from "@/components/Helpers/icons/Star";
import Layout from "@/components/Partials/Layout";
import ProductsFilter from "./ProductsFilter";

import { useGetSellerPublicByIdQuery } from "@/api-manage/api-call-functions/public/publicSeller.api";
import { buildSellerVM, BG_COVERS } from "@/components/Sellers/sellerHelpers";

export default function SallerPage() {
  const { id: slugOrId } = useParams(); // route örn: /saller-page/:id
  const { data: seller, isLoading, isError, refetch } = useGetSellerPublicByIdQuery(slugOrId, {
    skip: !slugOrId,
    refetchOnMountOrArgChange: true,
  });

  const vm = useMemo(
    () => (seller ? buildSellerVM(seller, 0, BG_COVERS) : null),
    [seller]
  );

  const [filters, setFilter] = useState({
    mobileLaptop: false,
    gaming: false,
    imageVideo: false,
    vehicles: false,
    furnitures: false,
    sport: false,
    foodDrinks: false,
    fashion: false,
    toilet: false,
    makeupCorner: false,
    babyItem: false,
    apple: false,
    samsung: false,
    walton: false,
    oneplus: false,
    vivo: false,
    oppo: false,
    xiomi: false,
    others: false,
    sizeS: false,
    sizeM: false,
    sizeL: false,
    sizeXL: false,
    sizeXXL: false,
    sizeFit: false,
  });

  const checkboxHandler = (e) => {
    const { name } = e.target;
    setFilter((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const [volume, setVolume] = useState({ min: 200, max: 500 });
  const [storage, setStorage] = useState(null);
  const [filterToggle, setToggle] = useState(false);

  const { products } = productDatas;

  return (
    <Layout>
      <div className="products-page-wrapper w-full">
        <div className="container-x mx-auto">
          {/* Header */}
          <div
            data-aos="fade-right"
            className="saller-info w-full mb-[40px] sm:h-[328px] sm:flex justify-between items-center px-11 overflow-hidden relative py-10 sm:py-0"
            style={{
              background: `url(${vm?.coverUrl || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/saller-cover.png`}) no-repeat`,
              backgroundSize: "cover",
            }}
          >
            <div className="store-status w-[230px] h-[60px] bg-qyellow flex justify-end items-center rounded-full absolute top-[30px] -left-[30px]">
              <span className="text-[26px] font-600 mr-[30px]">Store Open</span>
            </div>

            {/* Seller contact */}
            <div className="saller-text-details sm:mt-[55px] mt-[100px]">
              <ul>
                <li className="text-black flex space-x-5 items-center leading-9 text-base font-normal">
                  <span>
                    {/* mail icon */}
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.0025 3.36719C0.1568 3.46656 0.2605 3.53094 0.3624 3.59906C2.3971 4.95656 4.4312 6.31406 6.466 7.67156C7.5543 8.39781 8.4483 8.39844 9.5359 7.67281C11.5794 6.30969 13.6217 4.94531 15.6652 3.58219C15.7582 3.52031 15.8544 3.46219 15.9856 3.37969C15.9913 3.50031 15.9994 3.58781 15.9994 3.67594C16 5.91656 16.0013 8.15656 15.9994 10.3972C15.9988 11.3853 15.3903 11.9984 14.4038 11.9991C10.135 12.0009 5.8662 12.0009 1.5968 11.9991C0.6129 11.9984 0.0031 11.3834 0.0025 10.3959C0.0013 8.15469 0.0025 5.91469 0.0025 3.67406C0.0025 3.59156 0.0025 3.50844 0.0025 3.36719Z" fill="black"/>
                      <path d="M8.001 0.00122C10.1557 0.00122 12.3104 -0.00253 14.4651 0.0031C15.366 0.0056 16.0345 0.6806 15.9963 1.54C15.9732 2.05935 15.7058 2.4331 15.2792 2.71622C13.4156 3.95435 11.5564 5.1981 9.6953 6.44C9.4273 6.6187 9.1593 6.7987 8.89002 6.9769C8.29715 7.3706 7.70428 7.3719 7.11141 6.9762C4.97483 5.54935 2.83637 4.12435 0.699789 2.6956C0.100046 2.29435 -0.126731 1.68935 0.0681849 1.0475C0.256229 0.42685 0.820362 0.0056 1.50507 0.00372C3.33741 -0.00253 5.16912 0.00122 7.00146 0.00122C7.33506 0.00122 7.66805 0.00122 8.00103 0.00122Z" fill="black"/>
                    </svg>
                  </span>
                  <span>{vm?.email || "—"}</span>
                </li>

                <li className="text-black flex space-x-5 items-center leading-9 text-base font-normal">
                  <span>
                    {/* phone icon */}
                    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.5085 14.0001C10.5529 13.9553 9.6013 13.6377 8.6926 13.1988C6.27351 12.0295 4.30056 10.3639 2.60467 8.39981C1.65664 7.30216 0.854189 6.11977 0.351704 4.78105C0.0963526 4.09939 -0.084448 3.40133 0.0405862 2.66719C0.106332 2.27908 0.266587 1.9347 0.568313 1.65372C1.00388 1.24812 1.43592 0.838683 1.87618 0.437996C2.50077 -0.129964 3.37366 -0.152376 4.00587 0.410664C4.71205 1.03985 5.40649 1.68215 6.07862 2.34304C6.80124 3.05367 6.54589 4.09666 5.5826 4.47384C4.70383 4.81768 4.37452 5.42773 4.72966 6.25151C5.4106 7.8324 6.63746 8.94153 8.32865 9.57454C9.12171 9.87137 9.85842 9.52698 10.1918 8.7923C10.6145 7.86082 11.7292 7.63069 12.5129 8.33093C13.2114 8.9552 13.8936 9.59477 14.5669 10.2425C15.1533 10.8067 15.1416 11.6299 14.5475 12.2077C14.1014 12.6417 13.64 13.0627 13.1792 13.483C12.7383 13.8864 12.1842 13.999 11.5085 14.0001Z" fill="black"/>
                    </svg>
                  </span>
                  <span>{vm?.phone || "—"}</span>
                </li>

                <li className="text-black flex space-x-5 items-center leading-9 text-base font-normal">
                  <span>
                    {/* location icon */}
                    <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.97116 2.68819e-05C2.96055 0.0118815 -0.248362 3.57049 0.0150623 7.72998C0.107867 9.19477 0.60259 10.5136 1.45069 11.6909C3.13831 14.0337 4.82379 16.3787 6.5107 18.7214C6.77412 19.0875 7.21745 19.0934 7.47659 18.734C9.17135 16.3816 10.8761 14.0359 12.5566 11.6724C15.2879 7.83075 14.0101 2.65546 9.84454 0.632026C9.03428 0.239342 7.93562 -0.00293677 6.97116 2.68819e-05ZM6.99257 9.29479C5.81395 9.29035 4.85877 8.29975 4.85734 7.08094C4.85592 5.8614 5.80752 4.86931 6.98686 4.86116C8.17762 4.85301 9.14708 5.85769 9.13994 7.09428C9.13351 8.3116 8.16977 9.29924 6.99257 9.29479Z" fill="black"/>
                    </svg>
                  </span>
                  <span>{vm?.addressText || "—"}</span>
                </li>
              </ul>
            </div>

            {/* Name + Rating */}
            <div className="saller-name lg:block hidden">
              <h1 className="text-[60px] font-bold">{vm?.title || "—"}</h1>
              <div className="flex justify-center">
                <div className="flex">
                  <Star w="30" h="30" />
                  <Star w="30" h="30" />
                  <Star w="30" h="30" />
                  <Star w="30" h="30" />
                  <Star w="30" h="30" />
                  <span className="text-[22px] font-bold">({vm?.rating ?? 4.7})</span>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="saller-logo mt-5 sm:mt-5">
              <div className="flex sm:justify-center justify-start">
                <div className="w-[170px] h-[170px] flex justify-center items-center rounded-full bg-white mb-1 overflow-hidden">
                  <img
                    src={vm?.avatarUrl || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/saller-7.png`}
                    alt="logo"
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              </div>
              <div className="flex sm:justify-center justify-start">
                <span className="text-[30px] font-medium text-center">{vm?.title || "—"}</span>
              </div>
            </div>
          </div>

          {/* Seller fetch states */}
          {isLoading && (
            <div className="w-full p-5 bg-gray-100 rounded mb-6">Satıcı yükleniyor…</div>
          )}
          {isError && (
            <div className="w-full p-5 bg-red-50 border border-red-200 rounded text-red-700 mb-6">
              Satıcı bilgisi alınamadı.{" "}
              <button className="underline" onClick={() => refetch()}>
                Tekrar dene
              </button>
            </div>
          )}

          {/* Products + Filter */}
          <div className="w-full lg:flex lg:space-x-[30px]">
            <div className="lg:w-[270px]">
              <ProductsFilter
                filterToggle={filterToggle}
                filterToggleHandler={() => setToggle(!filterToggle)}
                filters={filters}
                checkboxHandler={checkboxHandler}
                volume={volume}
                volumeHandler={(value) => setVolume(value)}
                storage={storage}
                filterstorage={setStorage}
                className="mb-[30px]"
              />
              {/* ads */}
              <div className="w-full hidden lg:block h-[295px]">
                <img
                  src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-5.png`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px]">
                <div>
                  <p className="font-400 text-[13px]">
                    <span className="text-qgray"> Showing</span> 1–16 of 66 results
                  </p>
                </div>
                <div className="flex space-x-3 items-center">
                  <span className="font-400 text-[13px]">Sort by:</span>
                  <div className="flex space-x-3 items-center border-b border-b-qgray">
                    <span className="font-400 text-[13px] text-qgray">Default</span>
                    <span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#9A9A9A" />
                      </svg>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setToggle(!filterToggle)}
                  type="button"
                  className="w-10 lg:hidden h-10 rounded flex justify-center items-center border border-qyellow text-qyellow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>

              {/* Demo ürünler duruyor; gerçek ürün entegrasyonu eklenince burası değişecek */}
              <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1  xl:gap-[30px] gap-5 mb-[40px]">
                <DataIteration datas={products} startLength={0} endLength={6}>
                  {({ datas }) => (
                    <div data-aos="fade-up" key={datas.id}>
                      <ProductCardStyleOne datas={datas} />
                    </div>
                  )}
                </DataIteration>
              </div>

              <div className="w-full h-[164px] overflow-hidden mb-[40px]">
                <img
                  src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/bannera-6.png`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]">
                <DataIteration datas={products} startLength={6} endLength={15}>
                  {({ datas }) => (
                    <div data-aos="fade-up" key={datas.id}>
                      <ProductCardStyleOne datas={datas} />
                    </div>
                  )}
                </DataIteration>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
