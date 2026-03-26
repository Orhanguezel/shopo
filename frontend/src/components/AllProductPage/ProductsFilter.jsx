import Checkbox from "../Helpers/Checkbox";
import ServeLangItem from "../Helpers/ServeLangItem";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import CurrencyConvert from "../Shared/CurrencyConvert";
import FilterToggleIco from "../Helpers/icons/FilterToggleIco";
export default function ProductsFilter({
  categories,
  categoryHandler,
  varientHandler,
  brandsHandler,
  volume,
  volumeHandler,
  className,
  filterToggle,
  filterToggleHandler,
  variantsFilter,
  priceMin,
  priceMax,
  brands,
  clearAllFilters,
}) {
  return (
    <>
      <div
        className={`filter-widget w-full fixed lg:relative left-0 top-0 h-screen z-10 lg:h-auto overflow-y-scroll lg:overflow-y-auto bg-white px-[30px] pt-[40px] ${
          className || ""
        }  ${filterToggle ? "block" : "hidden lg:block"}`}
      >
        <div className="filter-subject-item pb-10 border-b border-qgray-border last:border-none">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">
              {ServeLangItem()?.Product_categories}
            </h1>
          </div>
          <div className="filter-items">
            <ul>
              {categories &&
                categories.length > 0 &&
                categories.map((item, i) => (
                  <li key={i} className="item mb-5">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-[14px] rtl:space-x-reverse items-center">
                        <div>
                          <Checkbox
                            id={item.slug}
                            name={item.id}
                            handleChange={(e) => categoryHandler(e)}
                            checked={item.selected}
                          />
                        </div>
                        <label
                          htmlFor={item.slug}
                          className="text-xs font-black font-400 capitalize"
                        >
                          {item.name}
                        </label>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="filter-subject-item pb-10 border-b border-qgray-border last:border-none mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">
              {ServeLangItem()?.Price_Range}
            </h1>
          </div>
          {volume && (
            <>
              <div className="price-range mb-5">
                <RangeSlider
                  value={volume}
                  onInput={volumeHandler}
                  min={priceMin}
                  max={priceMax}
                />
              </div>
              <p className="text-xs text-qblack font-400">
                {ServeLangItem()?.Price}: <CurrencyConvert price={volume[0]} />{" "}
                - <CurrencyConvert price={volume[1]} />
              </p>
            </>
          )}
        </div>
        <div className="filter-subject-item pb-10 border-b border-qgray-border last:border-none mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">
              {ServeLangItem()?.Brands}
            </h1>
          </div>
          <div className="filter-items">
            <ul>
              {brands &&
                brands.length > 0 &&
                brands.map((brand, i) => (
                  <li
                    key={i}
                    className="item flex justify-between items-center mb-5"
                  >
                    <div className="flex space-x-[14px] rtl:space-x-reverse items-center">
                      <div>
                        <Checkbox
                          id={brand.name}
                          name={brand.id}
                          handleChange={(e) => brandsHandler(e)}
                          checked={brand.selected}
                        />
                      </div>
                      <label
                        htmlFor={brand.name}
                        className="text-xs font-black font-400 capitalize"
                      >
                        {brand.name}
                      </label>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        {variantsFilter &&
          variantsFilter.length &&
          variantsFilter.map((variant, i) => (
            <div
              key={i}
              className={`filter-subject-item pb-10  border-b border-qgray-border last:border-none mt-10`}
            >
              <div className="subject-title mb-[30px]">
                <h1 className="text-black text-base font-500">
                  {variant.name}
                </h1>
              </div>
              <div className="filter-items">
                <ul>
                  {variant &&
                    variant.active_variant_items.length > 0 &&
                    variant.active_variant_items.map((varientItem, i) => (
                      <li
                        key={i}
                        className="item flex justify-between items-center mb-5"
                      >
                        <div className="flex space-x-[14px] rtl:space-x-reverse items-center">
                          <div>
                            <Checkbox
                              id={varientItem.name}
                              name={varientItem.name}
                              handleChange={(e) => varientHandler(e)}
                              checked={varientItem.selected}
                            />
                          </div>
                          <label
                            htmlFor={varientItem.name}
                            className="text-xs font-black font-400 capitalize"
                          >
                            {varientItem.name}
                          </label>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}

        {/* Clear All Filters Button */}
        <button
          onClick={clearAllFilters}
          type="button"
          className="w-full text-sm my-4 text-start text-qred transition-colors duration-200 font-medium"
        >
          Clear All Filters
        </button>

        <button
          onClick={filterToggleHandler}
          type="button"
          className="w-10 h-10 fixed top-5 right-5 z-50 rounded  lg:hidden flex justify-center items-center border border-qred text-qred"
        >
          <FilterToggleIco />
        </button>
      </div>
    </>
  );
}
