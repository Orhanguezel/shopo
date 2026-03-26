import apiRoutes from "@/appConfig/apiRoutes";
import { notFound } from "next/navigation";

/**
 * Function to get products
 * @param {string} type
 * @param {string} slug
 * @param {string} searchWithCategorySlug
 * If type is searchWithCategory, then searchWithCategorySlug is required
 * ex: `?search=hello&categories[]=electronics`
 * @returns {object}
 */
export default async function products(
  type,
  slug,
  searchWithCategorySlug = ""
) {
  let query = "";
  switch (type) {
    case "allProducts":
      query = "";
      break;
    case "category":
      query = `?category=${slug}`;
      break;
    case "sub_category":
      query = `?sub_category=${slug}`;
      break;
    case "child_category":
      query = `?child_category=${slug}`;
      break;
    case "highlight":
      query = `?highlight=${slug}`;
      break;
    case "brand":
      query = `?brand=${slug}`;
      break;
    case "search":
      query = `?search=${slug}`;
      break;
    case "searchWithCategory":
      query = `${searchWithCategorySlug}`;
      break;
    default:
      query = "";
      break;
  }

  const res = await fetch(`${apiRoutes.products + query}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    notFound();
  }
  try {
    const data = await res.json();
    return data;
  } catch (error) {
    notFound();
  }
}
