import apiRoutes from "@/appConfig/apiRoutes";

const PUBLIC_CONTENT_REVALIDATE = 300;

const EMPTY_HOMEPAGE = {
  sliders: [],
  services: [],
  homepage_categories: [],
  popularCategories: [],
  popularCategoryProducts: [],
  featuredCategories: [],
  featuredCategoryProducts: [],
  topRatedProducts: [],
  newArrivalProducts: [],
  bestProducts: [],
  brands: [],
  section_title: [],
  flashSale: null,
  flashSaleProducts: [],
};

export default async function home() {
  const apiUrl = `${apiRoutes.shopo}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: PUBLIC_CONTENT_REVALIDATE,
      },
    });

    if (!res.ok) {
      return EMPTY_HOMEPAGE;
    }

    try {
      return await res.json();
    } catch {
      return EMPTY_HOMEPAGE;
    }
  } catch {
    return EMPTY_HOMEPAGE;
  }
}
