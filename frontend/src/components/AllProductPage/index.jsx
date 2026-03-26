"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DataIteration from "../Helpers/DataIteration";
import Star from "../Helpers/icons/Star";
import ProductsFilter from "./ProductsFilter";
import OneColumnAdsTwo from "../Home/ProductAds/OneColumnAdsTwo";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import ServeLangItem from "../Helpers/ServeLangItem";
import ProductCard from "../Helpers/Cards/ProductCard";
import appConfig from "@/appConfig";
import ShopEmailIco from "../Helpers/icons/ShopEmailIco";
import ShopPhoneIco from "../Helpers/icons/ShopPhoneIco";
import ShopLocationIco from "../Helpers/icons/ShopLocationIco";
import ShopArrowIco from "../Helpers/icons/ShopArrowIco";
import ViewColIco from "../Helpers/icons/ViewColIco";
import ViewRowIco from "../Helpers/icons/ViewRowIco";
import FilterIco from "../Helpers/icons/FilterIco";
import {
  useLazyGetAllProductsApiQuery,
  useLazyNextPageProductsApiQuery,
} from "@/redux/features/product/apiSlice";

function AllProductPageContent({ response, sellerInfo }) {
  // Next.js routing hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Product data states
  const [resProducts, setProducts] = useState(null);
  const [nxtPage, setNxtPage] = useState(null);

  // Filter states
  const [variantsFilter, setVariantsFilter] = useState(null);
  const [categoriesFilter, setCategoriesFilter] = useState(null);
  const [brands, setBrands] = useState(null);
  const [volume, setVolume] = useState([0, 0]);

  // UI states
  const [cardViewStyle, setCardViewStyle] = useState("col");
  const [filterToggle, setToggle] = useState(false);

  // Selected filter items states
  const [selectedVarientFilterItem, setSelectedVarientFilterItem] = useState(
    []
  );
  const [selectedCategoryFilterItem, setSelectedCategoryFilterItem] = useState(
    []
  );
  const [selectedBrandsFilterItem, setSelectedBrandsFilterItem] = useState([]);

  // Helper function to ensure arrays are always arrays
  const ensureArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  // Debounce function to prevent too frequent URL updates
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Debounced URL update function (will be set after updateURL is defined)
  let debouncedUpdateURL;

  /**
   * Update URL with current filter parameters
   */
  const updateURL = (filters) => {
    try {
      // Check if router and pathname are available
      if (!router || !pathname) {
        return;
      }

      // Check if searchParams is available and valid
      if (!searchParams || typeof searchParams.get !== "function") {
        return;
      }

      const params = new URLSearchParams();

      // Preserve original page parameters (category, brand, type, slug, seller, etc.)
      // These are used by the page component to determine what products to load
      const originalParams = ["category", "brand", "type", "slug", "seller"];
      originalParams.forEach((param) => {
        try {
          const value = searchParams.get(param);
          if (value) {
            params.set(param, value);
          }
        } catch (error) {
          // Silent error handling
        }
      });

      // Validate filters object
      if (!filters || typeof filters !== "object") {
        console.error("Invalid filters object:", filters);
        return;
      }

      // Add new filter params with validation and limits
      if (
        filters.brands &&
        Array.isArray(filters.brands) &&
        filters.brands.length > 0
      ) {
        // Limit brands to first 5 to prevent URL from getting too long
        const limitedBrands = filters.brands.slice(0, 5);
        params.set("brands", limitedBrands.join(","));
      }

      if (
        filters.categories &&
        Array.isArray(filters.categories) &&
        filters.categories.length > 0
      ) {
        // Limit categories to first 5 to prevent URL from getting too long
        const limitedCategories = filters.categories.slice(0, 5);
        params.set("categories", limitedCategories.join(","));
      }

      if (
        filters.variantItems &&
        Array.isArray(filters.variantItems) &&
        filters.variantItems.length > 0
      ) {
        // Limit variant items to first 3 to prevent URL from getting too long
        const limitedVariants = filters.variantItems.slice(0, 3);
        params.set("variantItems", limitedVariants.join(","));
      }

      // Validate and add price parameters
      if (
        filters.min_price !== undefined &&
        filters.min_price !== null &&
        !isNaN(filters.min_price)
      ) {
        params.set("min_price", String(filters.min_price));
      }

      if (
        filters.max_price !== undefined &&
        filters.max_price !== null &&
        !isNaN(filters.max_price)
      ) {
        params.set("max_price", String(filters.max_price));
      }

      // Check URL length to prevent issues
      const newURL = `${pathname}?${params.toString()}`;

      // Limit URL length to prevent server issues (typically 2048 characters)
      if (newURL.length > 2000) {
        // Show user notification
        if (typeof window !== "undefined") {
          alert(
            "Too many filters selected. Some filters have been removed to keep the URL manageable."
          );
        }
        // Remove some filter parameters to shorten URL
        params.delete("brands");
        params.delete("categories");
        params.delete("variantItems");
        const shortenedURL = `${pathname}?${params.toString()}`;
        router.replace(shortenedURL, { scroll: false });
        return;
      }

      router.replace(newURL, { scroll: false });
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  };

  // Initialize the debounced function after updateURL is defined
  debouncedUpdateURL = debounce(updateURL, 300);

  /**
   * Parse URL parameters and set initial filter states
   */
  const parseURLParams = () => {
    try {
      // Handle both old format (multiple params) and new format (comma-separated)
      let brands = [];
      let categories = [];
      let variantItems = [];

      // Try new comma-separated format first
      const brandsParam = searchParams.get("brands");
      const categoriesParam = searchParams.get("categories");
      const variantItemsParam = searchParams.get("variantItems");

      if (brandsParam) {
        brands = brandsParam.split(",").filter((b) => b.trim() !== "");
      } else {
        // Fallback to old format
        brands = searchParams.getAll("brands");
      }

      if (categoriesParam) {
        categories = categoriesParam.split(",").filter((c) => c.trim() !== "");
      } else {
        // Fallback to old format
        categories = searchParams.getAll("categories");
      }

      if (variantItemsParam) {
        variantItems = variantItemsParam
          .split(",")
          .filter((v) => v.trim() !== "");
      } else {
        // Fallback to old format
        variantItems = searchParams.getAll("variantItems");
      }

      const minPrice = searchParams.get("min_price");
      const maxPrice = searchParams.get("max_price");

      return {
        brands: brands.length > 0 ? brands : [],
        categories: categories.length > 0 ? categories : [],
        variantItems: variantItems.length > 0 ? variantItems : [],
        min_price: minPrice ? parseInt(minPrice) : null,
        max_price: maxPrice ? parseInt(maxPrice) : null,
      };
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      return {
        brands: [],
        categories: [],
        variantItems: [],
        min_price: null,
        max_price: null,
      };
    }
  };

  /**
   * Transform raw product data into standardized format for ProductCard components
   */
  const products =
    resProducts &&
    resProducts.length > 0 &&
    resProducts.map((item) => ({
      id: item.id,
      title: item.name,
      slug: item.slug,
      image: appConfig.BASE_URL + item.thumb_image,
      price: item.price,
      offer_price: item.offer_price,
      campaingn_product: null,
      vendor_id: Number(item.vendor_id),
      review: parseInt(item.averageRating),
      variants: item.active_variants ? item.active_variants : [],
    }));

  /**
   * Handle price range slider changes
   * @param {Array|Event} value - Array containing [min, max] price values or event object
   */
  const volumeHandler = (value) => {
    // Handle different input types
    let priceValues;

    if (Array.isArray(value)) {
      // Direct array input
      priceValues = value;
    } else if (value && value.target && value.target.value) {
      // Event object with target value
      try {
        priceValues = JSON.parse(value.target.value);
      } catch (e) {
        console.error("Failed to parse target value:", value.target.value);
        return;
      }
    } else if (value && value.detail) {
      // Event object with detail
      priceValues = value.detail;
    } else {
      console.error("Unsupported value format:", value);
      return;
    }

    // Validate the price values array
    if (!Array.isArray(priceValues) || priceValues.length !== 2) {
      console.error("Invalid price range value:", priceValues);
      return;
    }

    // Ensure values are numbers
    const minPrice =
      typeof priceValues[0] === "number"
        ? priceValues[0]
        : parseFloat(priceValues[0]);
    const maxPrice =
      typeof priceValues[1] === "number"
        ? priceValues[1]
        : parseFloat(priceValues[1]);

    // Check if parsing was successful
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      console.error("Invalid price values:", priceValues);
      return;
    }

    setVolume([minPrice, maxPrice]);

    // Update URL with new price range
    const currentFilters = {
      brands: ensureArray(selectedBrandsFilterItem),
      categories: ensureArray(selectedCategoryFilterItem),
      variantItems: ensureArray(selectedVarientFilterItem),
      min_price: minPrice,
      max_price: maxPrice,
    };

    // Check if debouncedUpdateURL is available
    if (typeof debouncedUpdateURL === "function") {
      debouncedUpdateURL(currentFilters);
    } else {
      updateURL(currentFilters);
    }
  };

  /**
   * Handle variant filter selection/deselection
   * @param {Event} e - Click event from variant checkbox
   */
  const varientHandler = (e) => {
    if (!e || !e.target || !e.target.name) {
      console.error("Invalid event or target in varientHandler:", e);
      return;
    }

    const { name } = e.target;

    // Update variants filter state with selected/deselected items
    const filterVariant =
      variantsFilter &&
      variantsFilter.length > 0 &&
      variantsFilter.map((varient) => ({
        ...varient,
        active_variant_items:
          varient.active_variant_items &&
          varient.active_variant_items.length > 0 &&
          varient.active_variant_items.map((variant_item) => ({
            ...variant_item,
            selected:
              variant_item.name === name
                ? !variant_item.selected
                : variant_item.selected,
          })),
      }));

    setVariantsFilter(filterVariant);

    // Update selected variants array
    let newSelectedVariants;
    if (selectedVarientFilterItem.includes(name)) {
      newSelectedVariants = selectedVarientFilterItem.filter(
        (like) => like !== name
      );
      setSelectedVarientFilterItem(newSelectedVariants);
    } else {
      // Check if adding this filter would exceed the limit
      const totalFilters =
        selectedVarientFilterItem.length +
        selectedCategoryFilterItem.length +
        selectedBrandsFilterItem.length +
        1;
      if (totalFilters > 8) {
        // alert(
        //   "Too many filters selected. Please remove some filters before adding more."
        // );
        return;
      }
      newSelectedVariants = [...selectedVarientFilterItem, name];
      setSelectedVarientFilterItem(newSelectedVariants);
    }

    // Update URL with new variant selection
    const currentFilters = {
      brands: ensureArray(selectedBrandsFilterItem),
      categories: ensureArray(selectedCategoryFilterItem),
      variantItems: ensureArray(newSelectedVariants),
      min_price: volume && volume[0] !== undefined ? volume[0] : null,
      max_price: volume && volume[1] !== undefined ? volume[1] : null,
    };

    if (typeof debouncedUpdateURL === "function") {
      debouncedUpdateURL(currentFilters);
    } else {
      updateURL(currentFilters);
    }
  };

  /**
   * Handle category filter selection/deselection
   * @param {Event} e - Click event from category checkbox
   */
  const categoryHandler = (e) => {
    if (!e || !e.target || !e.target.name) {
      console.error("Invalid event or target in categoryHandler:", e);
      return;
    }

    const { name } = e.target;

    // Update categories filter state with selected/deselected items
    const filterCat =
      categoriesFilter &&
      categoriesFilter.length > 0 &&
      categoriesFilter.map((item) => ({
        ...item,
        selected:
          parseInt(item.id) === parseInt(name) ? !item.selected : item.selected,
      }));

    setCategoriesFilter(filterCat);

    // Update selected categories array
    let newSelectedCategories;
    if (selectedCategoryFilterItem.includes(name)) {
      newSelectedCategories = selectedCategoryFilterItem.filter(
        (like) => like !== name
      );
      setSelectedCategoryFilterItem(newSelectedCategories);
    } else {
      // Check if adding this filter would exceed the limit
      const totalFilters =
        selectedVarientFilterItem.length +
        selectedCategoryFilterItem.length +
        selectedBrandsFilterItem.length +
        1;
      if (totalFilters > 8) {
        // alert(
        //   "Too many filters selected. Please remove some filters before adding more."
        // );
        return;
      }
      newSelectedCategories = [...selectedCategoryFilterItem, name];
      setSelectedCategoryFilterItem(newSelectedCategories);
    }

    // Update URL with new category selection
    const currentFilters = {
      brands: ensureArray(selectedBrandsFilterItem),
      categories: ensureArray(newSelectedCategories),
      variantItems: ensureArray(selectedVarientFilterItem),
      min_price: volume && volume[0] !== undefined ? volume[0] : null,
      max_price: volume && volume[1] !== undefined ? volume[1] : null,
    };

    if (typeof debouncedUpdateURL === "function") {
      debouncedUpdateURL(currentFilters);
    } else {
      updateURL(currentFilters);
    }
  };

  /**
   * Handle brand filter selection/deselection
   * @param {Event} e - Click event from brand checkbox
   */
  const brandsHandler = (e) => {
    if (!e || !e.target || !e.target.name) {
      console.error("Invalid event or target in brandsHandler:", e);
      return;
    }

    const { name } = e.target;

    // Update brands filter state with selected/deselected items
    const filterBrands =
      brands &&
      brands.length > 0 &&
      brands.map((item) => ({
        ...item,
        selected:
          parseInt(item.id) === parseInt(name) ? !item.selected : item.selected,
      }));

    setBrands(filterBrands);

    // Update selected brands array
    let newSelectedBrands;
    if (selectedBrandsFilterItem.includes(name)) {
      newSelectedBrands = selectedBrandsFilterItem.filter(
        (like) => like !== name
      );
      setSelectedBrandsFilterItem(newSelectedBrands);
    } else {
      // Check if adding this filter would exceed the limit
      const totalFilters =
        selectedVarientFilterItem.length +
        selectedCategoryFilterItem.length +
        selectedBrandsFilterItem.length +
        1;
      if (totalFilters > 8) {
        // alert(
        //   "Too many filters selected. Please remove some filters before adding more."
        // );
        return;
      }
      newSelectedBrands = [...selectedBrandsFilterItem, name];
      setSelectedBrandsFilterItem(newSelectedBrands);
    }

    // Update URL with new brand selection
    const currentFilters = {
      brands: ensureArray(newSelectedBrands),
      categories: ensureArray(selectedCategoryFilterItem),
      variantItems: ensureArray(selectedVarientFilterItem),
      min_price: volume && volume[0] !== undefined ? volume[0] : null,
      max_price: volume && volume[1] !== undefined ? volume[1] : null,
    };

    if (typeof debouncedUpdateURL === "function") {
      debouncedUpdateURL(currentFilters);
    } else {
      updateURL(currentFilters);
    }
  };

  /**
   * Handle filter toggle for mobile view
   */
  const handleFilterToggle = () => setToggle(!filterToggle);

  /**
   * Get the count of active filters
   */
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedVarientFilterItem.length > 0)
      count += selectedVarientFilterItem.length;
    if (selectedCategoryFilterItem.length > 0)
      count += selectedCategoryFilterItem.length;
    if (selectedBrandsFilterItem.length > 0)
      count += selectedBrandsFilterItem.length;

    // Check if price range is different from original
    if (response) {
      const min = Math.min(
        ...response.products.data.map((item) => parseInt(item.price))
      );
      const max = Math.max(
        ...response.products.data.map((item) => parseInt(item.price))
      );
      if (volume[0] !== min || volume[1] !== max) count += 1;
    }

    return count;
  };

  /**
   * Handle card view style changes (column vs row layout)
   * @param {string} style - View style ('col' or 'row')
   */
  const handleCardViewStyle = (style) => setCardViewStyle(style);

  /**
   * Clear all applied filters and reset to default state
   */
  const clearAllFilters = () => {
    // Reset all selected filter items
    setSelectedVarientFilterItem([]);
    setSelectedCategoryFilterItem([]);
    setSelectedBrandsFilterItem([]);

    // Reset filter states
    if (variantsFilter) {
      setVariantsFilter(
        variantsFilter.map((varient) => ({
          ...varient,
          active_variant_items:
            varient.active_variant_items &&
            varient.active_variant_items.map((variant_item) => ({
              ...variant_item,
              selected: false,
            })),
        }))
      );
    }

    if (categoriesFilter) {
      setCategoriesFilter(
        categoriesFilter.map((item) => ({
          ...item,
          selected: false,
        }))
      );
    }

    if (brands) {
      setBrands(
        brands.map((item) => ({
          ...item,
          selected: false,
        }))
      );
    }

    // Reset price range to original values
    if (response) {
      const min = Math.min(
        ...response.products.data.map((item) => parseInt(item.price))
      );
      const max = Math.max(
        ...response.products.data.map((item) => parseInt(item.price))
      );
      setVolume([min, max]);
    }

    // Clear URL parameters while preserving original page parameters
    const params = new URLSearchParams();

    // Preserve original page parameters
    const originalParams = ["category", "brand", "type", "slug", "seller"];
    originalParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        params.set(param, value);
      }
    });

    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Initialize component data when response changes
   */
  useEffect(() => {
    if (!response) return;

    // Set products and pagination data
    setProducts(response.products.data);
    setNxtPage(response.products.next_page_url);

    // Parse URL parameters for initial filter states
    const urlParams = parseURLParams();

    // Initialize categories filter with selection state from URL
    setCategoriesFilter(
      response.categories.length > 0 &&
        response.categories.map((item) => ({
          ...item,
          selected: urlParams.categories.includes(item.id.toString()),
        }))
    );

    // Initialize variants filter with selection state from URL
    setVariantsFilter(
      response.activeVariants.length > 0 &&
        response.activeVariants.map((varient) => ({
          ...varient,
          active_variant_items:
            varient.active_variant_items &&
            varient.active_variant_items.length > 0 &&
            varient.active_variant_items.map((variant_item) => ({
              ...variant_item,
              selected: urlParams.variantItems.includes(variant_item.name),
            })),
        }))
    );

    // Initialize brands filter with selection state from URL
    setBrands(
      response.brands.length > 0 &&
        response.brands.map((item) => ({
          ...item,
          selected: urlParams.brands.includes(item.id.toString()),
        }))
    );

    // Calculate and set price range
    const min = Math.min(
      ...response.products.data.map((item) => parseInt(item.price))
    );
    const max = Math.max(
      ...response.products.data.map((item) => parseInt(item.price))
    );

    // Use URL price range if available, otherwise use calculated range
    const initialVolume = [
      urlParams.min_price !== null ? urlParams.min_price : min,
      urlParams.max_price !== null ? urlParams.max_price : max,
    ];
    setVolume(initialVolume);

    // Set selected filter items from URL
    setSelectedCategoryFilterItem(urlParams.categories);
    setSelectedVarientFilterItem(urlParams.variantItems);
    setSelectedBrandsFilterItem(urlParams.brands);
  }, [response, searchParams]);

  /**
   * Filter Products functionality
   * @Initializes useLazyGetAllProductsApiQuery @const getAllProductsApi
   * Api call using useEffect
   * @Initializes useLazyNextPageProductsApiQuery @const nextPageProductsApi
   * @func nextPageHandler
   */

  const [getAllProductsApi, { isLoading: isLoadingGetAllProductsApi }] =
    useLazyGetAllProductsApiQuery();

  /**
   * Handle filter changes and trigger API calls
   */
  useEffect(() => {
    if (!response) return;

    const min = Math.min(
      ...response.products.data.map((item) => parseInt(item.price))
    );
    const max = Math.max(
      ...response.products.data.map((item) => parseInt(item.price))
    );

    // Check if any filters are applied
    const hasActiveFilters =
      selectedVarientFilterItem.length > 0 ||
      selectedCategoryFilterItem.length > 0 ||
      selectedBrandsFilterItem.length > 0 ||
      (volume[0] && volume[0] !== min) ||
      (volume[1] && volume[1] !== max);

    if (hasActiveFilters) {
      // Build query parameters for filtered API call
      const brandsQuery =
        selectedBrandsFilterItem.length > 0
          ? selectedBrandsFilterItem.map((value) => `brands[]=${value}`)
          : [];
      const brandString =
        brandsQuery.length > 0
          ? brandsQuery.map((value) => value + "&").join("")
          : "";

      const categoryQuery =
        selectedCategoryFilterItem.length > 0
          ? selectedCategoryFilterItem.map((value) => `categories[]=${value}`)
          : [];
      const categoryString =
        categoryQuery.length > 0
          ? categoryQuery.map((value) => value + "&").join("")
          : "";

      const variantQuery =
        selectedVarientFilterItem.length > 0
          ? selectedVarientFilterItem.map((value) => `variantItems[]=${value}`)
          : [];
      const variantString =
        variantQuery.length > 0
          ? variantQuery.map((value) => value + "&").join("")
          : "";

      // final query
      const query = `${brandString && brandString}${
        categoryString && categoryString
      }${variantString && variantString}min_price=${volume[0]}&max_price=${
        volume[1]
      }${sellerInfo ? `&shop_name=${sellerInfo.seller.slug}` : ""}`;

      const fetchProducts = async (query) => {
        const products = await getAllProductsApi(query).unwrap();
        const productsData = products?.products?.data;
        productsData && productsData?.length > 0
          ? setProducts(productsData)
          : setProducts(response.products.data);
      };
      fetchProducts(query);
    } else {
      // Reset to original products if no filters
      setProducts(response.products.data);
    }
  }, [
    selectedVarientFilterItem,
    selectedCategoryFilterItem,
    selectedBrandsFilterItem,
    volume,
    response,
  ]);

  const [nextPageProductsApi, { isLoading: isLoadingNextPageProductsApi }] =
    useLazyNextPageProductsApiQuery();

  /**
   * Load next page of products
   */
  const nextPageHandler = async () => {
    if (!nxtPage || nxtPage === "null") {
      return false;
    }
    const fetchProducts = async (url) => {
      const products = await nextPageProductsApi(url).unwrap();
      const productsData = products?.products?.data;
      if (productsData && productsData?.length > 0) {
        setProducts((prev) => [...prev, ...productsData]);
        setNxtPage(products?.products?.next_page_url);
      }
    };
    fetchProducts(nxtPage);
  };

  // RENDER HELPERS

  /**
   * Render seller information section
   */
  const renderSellerInfo = () => {
    if (!sellerInfo) return null;

    return (
      <div
        data-aos="fade-right"
        className="saller-info w-full mb-[40px] sm:h-[328px] sm:flex justify-between items-center px-11 overflow-hidden relative py-10 sm:py-0"
        style={{
          background: `url(/assets/images/saller-cover.png) no-repeat`,
          backgroundSize: "cover",
        }}
      >
        {/* Seller Contact Information */}
        <div className="saller-text-details w-72">
          <ul>
            <li className="text-black flex space-x-5 rtl:space-x-reverse items-center leading-9 text-base font-normal">
              <span>
                <ShopEmailIco />
              </span>
              <span>{sellerInfo.seller.email}</span>
            </li>
            <li className="text-black flex space-x-5 rtl:space-x-reverse items-center leading-9 text-base font-normal">
              <span>
                <ShopPhoneIco />
              </span>
              <span>{sellerInfo.seller.phone}</span>
            </li>
            <li className="text-black flex space-x-5 rtl:space-x-reverse items-center leading-9 text-base font-normal">
              <span>
                <ShopLocationIco />
              </span>
              <span>{sellerInfo.seller.address}</span>
            </li>
          </ul>
        </div>

        {/* Seller Name and Rating - Desktop */}
        <div className="saller-name lg:block hidden">
          <h1 className="text-[60px] font-bold notranslate">
            {sellerInfo.seller.shop_name}
          </h1>
          <div className="flex justify-center">
            {Array.from(
              Array(parseInt(sellerInfo.seller.averageRating)),
              () => (
                <span
                  key={
                    parseInt(sellerInfo.seller.averageRating) + Math.random()
                  }
                >
                  <Star />
                </span>
              )
            )}
            {parseInt(sellerInfo.seller.averageRating) < 5 && (
              <>
                {Array.from(
                  Array(5 - parseInt(sellerInfo.seller.averageRating)),
                  () => (
                    <span
                      key={
                        parseInt(sellerInfo.seller.averageRating) +
                        Math.random()
                      }
                      className="text-gray-500"
                    >
                      <svg
                        width="18"
                        height="17"
                        viewBox="0 0 18 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                      >
                        <path d="M9 0L11.0206 6.21885H17.5595L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885H6.97937L9 0Z" />
                      </svg>
                    </span>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Seller Logo and Name - Mobile */}
        <div className="saller-logo mt-5 sm:mt-5">
          <div className="flex sm:justify-center justify-start">
            <div className="w-[170px] h-[170px] p-[30px] flex justify-center items-center rounded-full bg-white relative mb-1 overflow-hidden">
              <img
                className="w-full h-full object-contain"
                src={`${appConfig.BASE_URL + sellerInfo.seller.logo}`}
                alt="logo"
              />
            </div>
          </div>
          <div className="flex sm:justify-center justify-start">
            <span className="text-[30px] font-medium text-center notranslate">
              {sellerInfo.seller.shop_name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render sidebar banner
   */
  const renderSidebarBanner = () => {
    if (
      !response?.shopPageSidebarBanner ||
      parseInt(response.shopPageSidebarBanner.status) !== 1
    ) {
      return null;
    }

    return (
      <div
        style={{
          backgroundImage: `url(${
            appConfig.BASE_URL + response.shopPageSidebarBanner.image
          })`,
          backgroundSize: `cover`,
          backgroundRepeat: `no-repeat`,
        }}
        className="w-full hidden py-[35px] ltr:pl-[40px] rtl:pr-[40px] group lg:block h-[295px] relative"
      >
        <div className="flex flex-col justify-between w-full h-full">
          <div>
            <div className="mb-[10px]">
              <span className="text-qblack uppercase text-xs font-semibold">
                {response.shopPageSidebarBanner.title_one}
              </span>
            </div>
            <div className="mb-[30px]">
              <h1 className="w-[162px] text-[24px] leading-[40px] text-qblack font-semibold">
                {response.shopPageSidebarBanner.title_two}
              </h1>
            </div>
          </div>
          <div className="w-auto">
            <Link
              href={{
                pathname: "/products",
                query: {
                  category: response.shopPageSidebarBanner.product_slug,
                },
              }}
            >
              <div className="cursor-pointer w-full relative">
                <div className="inline-flex space-x-1.5 rtl:space-x-reverse items-center relative z-20">
                  <span className="text-sm text-qblack font-medium leading-[30px]">
                    {ServeLangItem()?.Shop_Now}
                  </span>
                  <span className="leading-[30px]">
                    <ShopArrowIco />
                  </span>
                </div>
                <div className="w-[82px] transition-all duration-300 ease-in-out group-hover:h-4 h-[2px] bg-qyellow absolute ltr:left-0 rtl:right-0 bottom-0 z-10"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render product sorting and view controls
   */
  const renderProductControls = () => {
    if (!response?.products?.data?.length) return null;

    return (
      <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[30px] mb-[40px]">
        {/* Results count */}
        <div>
          <p className="font-400 text-[13px]">
            <span className="text-qgray">{ServeLangItem()?.Showing}</span> 1–
            {response.products.data.length} {ServeLangItem()?.of}{" "}
            {response.products.total} {ServeLangItem()?.results}
          </p>
        </div>

        {/* View style controls */}
        <div className="flex space-x-3 items-center">
          <span className="font-bold text-qblack text-[13px]">
            {ServeLangItem()?.View_by} :
          </span>
          <button
            onClick={() => handleCardViewStyle("col")}
            type="button"
            className={`hover:text-qgreen w-6 h-6 ${
              cardViewStyle === "col" ? "text-qgreen" : "text-qgray"
            }`}
          >
            <ViewColIco />
          </button>
          <button
            onClick={() => handleCardViewStyle("row")}
            type="button"
            className={`hover:text-qgreen w-6 h-6 ${
              cardViewStyle === "row" ? "text-qgreen" : "text-qgray"
            }`}
          >
            <ViewRowIco />
          </button>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={handleFilterToggle}
          type="button"
          className="w-10 lg:hidden h-10 rounded flex justify-center items-center border border-qyellow text-qyellow relative"
        >
          <FilterIco />
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-qred text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>
    );
  };

  /**
   * Render products grid
   */
  const renderProductsGrid = (productsData, startIndex = 0, endIndex = 6) => {
    if (!productsData) return null;

    const gridClass =
      cardViewStyle === "col"
        ? "grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]"
        : "grid lg:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5 mb-[40px]";

    const productStyle = cardViewStyle === "row" ? "row-v2" : undefined;

    return (
      <div className={gridClass}>
        <DataIteration
          datas={productsData}
          startLength={startIndex}
          endLength={endIndex}
        >
          {({ datas }) => (
            <div data-aos="fade-up" key={datas.id}>
              <ProductCard datas={datas} styleType={productStyle} />
            </div>
          )}
        </DataIteration>
      </div>
    );
  };

  /**
   * Render load more button
   */
  const renderLoadMoreButton = () => {
    if (!nxtPage || nxtPage === "null") return null;

    return (
      <div className="flex justify-center">
        <button
          disabled={isLoadingNextPageProductsApi}
          onClick={nextPageHandler}
          type="button"
          className="w-[180px] h-[54px] bg-qyellow rounded mt-10 disabled:cursor-not-allowed"
        >
          <div className="flex justify-center w-full h-full items-center group rounded relative transition-all duration-300 ease-in-out overflow-hidden cursor-pointer">
            <div className="flex items-center transition-all duration-300 ease-in-out relative z-10 text-white hover:text-white">
              <span className="text-sm font-600 tracking-wide leading-7 mr-2">
                {ServeLangItem()?.Show_more}...
              </span>
              {isLoadingNextPageProductsApi && (
                <span className="w-5" style={{ transform: "scale(0.3)" }}>
                  <LoaderStyleOne />
                </span>
              )}
            </div>
            <div
              style={{ transition: `transform 0.25s ease-in-out` }}
              className="w-full h-full bg-black absolute top-0 left-0 right-0 bottom-0 transform scale-x-0 group-hover:scale-x-100 origin-[center_left] group-hover:origin-[center_right]"
            ></div>
          </div>
        </button>
      </div>
    );
  };

  // Main Component Render
  return (
    <div className="products-page-wrapper w-full">
      <div className="container-x mx-auto">
        {/* Seller Information Section */}
        {renderSellerInfo()}

        <div className="w-full lg:flex lg:space-x-[30px] rtl:space-x-reverse">
          {/* Left Sidebar - Filters and Banner */}
          <div className="lg:w-[270px]">
            {/* Products Filter Component */}
            <ProductsFilter
              filterToggle={filterToggle}
              filterToggleHandler={handleFilterToggle}
              categories={categoriesFilter}
              brands={brands}
              varientHandler={varientHandler}
              categoryHandler={categoryHandler}
              brandsHandler={brandsHandler}
              volume={volume}
              priceMax={
                response &&
                Math.max(
                  ...response.products.data.map((item) => parseInt(item.price))
                )
              }
              priceMin={
                response &&
                Math.min(
                  ...response.products.data.map((item) => parseInt(item.price))
                )
              }
              volumeHandler={volumeHandler}
              className="mb-[30px]"
              variantsFilter={variantsFilter}
              clearAllFilters={clearAllFilters}
            />

            {/* Sidebar Banner */}
            {renderSidebarBanner()}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {response && response.products.data.length > 0 ? (
              <div className="w-full">
                {/* Product Controls */}
                {renderProductControls()}

                {/* First Products Grid */}
                {renderProductsGrid(products, 0, products?.length)}

                {/* Load More Button */}
                {renderLoadMoreButton()}

                {/* Banner */}
                <div className="w-full relative text-qblack my-[40px]">
                  {response.shopPageCenterBanner && (
                    <OneColumnAdsTwo
                      data={
                        response.shopPageCenterBanner &&
                        parseInt(response.shopPageCenterBanner.status) === 1
                          ? response.shopPageCenterBanner
                          : null
                      }
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 flex justify-center">
                <h1 className="text-2xl font-medium text-tblack">
                  Products not available
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllProductPage({ response, sellerInfo }) {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <AllProductPageContent response={response} sellerInfo={sellerInfo} />
    </Suspense>
  );
}
