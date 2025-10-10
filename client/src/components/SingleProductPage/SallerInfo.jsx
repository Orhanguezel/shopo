// src/components/SingleProductPage/SallerInfo.jsx
import ProductCardStyleOne from "@/components/Helpers/Cards/ProductCardStyleOne";
import DataIteration from "@/components/Helpers/DataIteration";
import Star from "@/components/Helpers/icons/Star";
import { pickTitle } from "@/utils/product.helpers";

export default function SallerInfo({ products = [] }) {
  return (
    <div className="saller-info-wrapper w-full">
      <div className="saller-info sm:flex justify-between items-center pb-[30px] border-b border-[#E8E8E8]">
        <div className="sm:flex sm:space-x-5 items-center sm:w-1/4">
          <div className="saller w-[73px] h-[73px] rounded-full overflow-hidden">
            <img
              src={`${import.meta.env.VITE_PUBLIC_URL}/assets/images/comment-user-1.png`}
              alt="seller"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h6 className="text-[18px] font-medium leading-[30px]">Shop</h6>
            <p className="text-[13px] font-normal text-qgray leading-[30px]">—</p>
            <div className="flex items-center mt-4">
              <div className="flex">
                <Star w="15" h="15" /><Star w="15" h="15" /><Star w="15" h="15" /><Star w="15" h="15" /><Star w="15" h="15" />
              </div>
              <span className="text-[13px] font-normal ml-1">(4.5)</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full sm:flex sm:space-x-5 justify-between sm:ml-[60px] mt-5 sm:mt-0">
          <div className="w-full mb-5 sm:mb-0">
            <ul>
              <li className="text-qgray leading-[30px]"><span className="text-[15px] font-normal text-qblack">Products</span>: {products.length}</li>
              <li className="text-qgray leading-[30px]"><span className="text-[15px] font-normal text-qblack">Category</span>: —</li>
              <li className="text-qgray leading-[30px]"><span className="text-[15px] font-normal text-qblack">Tags</span>: —</li>
            </ul>
          </div>
          <div className="w-full ">
            <ul>
              <li className="text-qgray leading-[30px]"><span className="text-[15px] font-normal text-qblack">Rating</span>: 4.5</li>
              <li className="text-qgray leading-[30px]"><span className="text-[15px] font-normal text-qblack">Location</span>: —</li>
              <li className="text-qgray leading-[30px]"><span className="text-[15px] font-normal text-qblack">Since</span>: —</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="saller-product w-full mt-[30px]">
        <h1 className="text-[18px] font-medium mb-5">Products from Shop</h1>
        {products.length === 0 ? (
          <div className="text-qgray py-8">No products.</div>
        ) : (
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
            <DataIteration datas={products} startLength={0} endLength={products.length}>
              {({ datas }) => (
                <div key={pickTitle(datas) + Math.random()} className="item">
                  <ProductCardStyleOne datas={datas} />
                </div>
              )}
            </DataIteration>
          </div>
        )}
      </div>
    </div>
  );
}
