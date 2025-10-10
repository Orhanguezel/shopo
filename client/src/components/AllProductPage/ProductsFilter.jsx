import RangeSlider from "react-range-slider-input";
import Checkbox from "@/components/Helpers/Checkbox";

export default function ProductsFilter({
  className,
  filterToggle,
  filterToggleHandler,

  /* dinamik kaynaklar (parent’tan) */
  categories = [],
  categoriesLoading = false,
  brands = [],
  brandsLoading = false,

  /* seçimler & handler’lar */
  selectedCategories,
  onToggleCategory,

  price,
  onPriceChange,

  selectedBrands,
  onToggleBrand,

  storage,
  onStorageChange,

  sizes,
  onToggleSize,
}) {
  /* localized isim seçici */
  const pickName = (obj) => {
    const t = obj?.name || obj?.title;
    if (!t) return "—";
    if (typeof t === "string") return t;
    try {
      const lang = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2);
      return t[lang] || t.en || t.tr || Object.values(t).find(Boolean) || "—";
    } catch {
      return "—";
    }
  };

  return (
    <>
      <div
        className={`filter-widget w-full fixed lg:relative left-0 top-0 h-screen z-10 lg:h-auto overflow-y-scroll lg:overflow-y-auto bg-white px-[30px] pt-[40px] ${className || ""
          }  ${filterToggle ? "block" : "hidden lg:block"}`}
      >
        {/* CATEGORIES (API’den parent ile gelen) */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Product categories</h1>
          </div>
          <div className="filter-items">
            {categoriesLoading && <div className="text-xs text-qgray mb-2">Loading…</div>}
            {!categoriesLoading && categories.length === 0 && (
              <div className="text-xs text-qgray mb-2">No category</div>
            )}
            <ul>
              {categories.map((c) => {
                const id = String(c?.id || c?._id || "");
                const title = pickName(c);
                const checked = selectedCategories.includes(id);
                return (
                  <li key={id} className="item flex justify-between items-center mb-5">
                    <div className="flex space-x-[14px] items-center">
                      <div>
                        <Checkbox
                          id={`cat-${id}`}
                          name={`cat-${id}`}
                          handleChange={() => onToggleCategory(id)}
                          checked={checked}
                        />
                      </div>
                      <div>
                        <label htmlFor={`cat-${id}`} className="text-xs font-black font-400 capitalize">
                          {title}
                        </label>
                      </div>
                    </div>
                    <div>
                      <span className="cursor-pointer">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect y="4" width="10" height="2" fill="#C4C4C4" />
                          <rect x="6" width="10" height="2" transform="rotate(90 6 0)" fill="#C4C4C4" />
                        </svg>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* PRICE RANGE */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Price Range</h1>
          </div>
          <div className="price-range mb-5">
            <RangeSlider value={price} onInput={onPriceChange} min={10} max={1000} />
          </div>
          <p className="text-xs text-qblack font-400">Price: ${price.min} - ${price.max}</p>
        </div>

        {/* BRANDS (API’den parent ile gelen) */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Brands</h1>
          </div>
          <div className="filter-items">
            {brandsLoading && <div className="text-xs text-qgray mb-2">Loading…</div>}
            {!brandsLoading && brands.length === 0 && (
              <div className="text-xs text-qgray mb-2">No brand</div>
            )}
            <ul>
              {brands.map((b) => {
                const id = String(b?.id || b?._id || "");
                const name = pickName(b);
                const checked = selectedBrands.includes(id);
                return (
                  <li key={id} className="item flex justify-between items-center mb-5">
                    <div className="flex space-x-[14px] items-center">
                      <div>
                        <Checkbox
                          id={`brand-${id}`}
                          name={`brand-${id}`}
                          handleChange={() => onToggleBrand(id)}
                          checked={checked}
                        />
                      </div>
                      <div>
                        <label htmlFor={`brand-${id}`} className="text-xs font-black font-400 capitalize">
                          {name}
                        </label>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* STORAGE */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Storage</h1>
          </div>
          <div className="filter-items">
            <div className="flex space-x-[5px] flex-wrap">
              {["64GB", "128GB", "256GB", "512GB", "1024GB"].map((s) => (
                <span
                  key={s}
                  onClick={() => onStorageChange(s)}
                  className={` font-400 border border-qgray-border text-xs px-[14px] py-[6px] cursor-pointer mb-[5px] ${storage === s ? "bg-qyellow text-qblack border-none" : " text-qgray "
                    }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SIZES */}
        <div className="filter-subject-item pb-10 mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Sizes</h1>
          </div>
          <div className="filter-items">
            <ul>
              {[
                ["sizeS", "S"],
                ["sizeM", "M"],
                ["sizeXL", "XL"],
                ["sizeXXL", "XXL"],
                ["sizeFit", "Fit"],
              ].map(([key, label]) => (
                <li key={key} className="item flex justify-between items-center mb-5">
                  <div className="flex space-x-[14px] items-center">
                    <div>
                      <Checkbox
                        id={key}
                        name={key}
                        handleChange={() => onToggleSize(label)}
                        checked={!!sizes[label]}
                      />
                    </div>
                    <div>
                      <label htmlFor={key} className="text-xs font-black font-400 capitalize">
                        {label}
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Close (mobile) */}
        <button
          onClick={filterToggleHandler}
          type="button"
          className="w-10 h-10 fixed top-5 right-5 z-50 rounded  lg:hidden flex justify-center items-center border border-qred text-qred"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
