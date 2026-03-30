import appConfig from "@/appConfig";
import { buildProductUrl } from "@/utils/url";

const baseUrl = appConfig.APPLICATION_URL || "https://seyfibaba.com";

export default async function sitemap() {
  const routes = [
    "", "/products", "/about", "/contact", "/faq",
    "/terms-condition", "/privacy-policy", "/sellers",
    "/flash-sale",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  let categories = [];
  let sellerEntries = [];
  let productEntries = [];

  try {
    const [homeRes, sellersRes, productsRes] = await Promise.all([
      fetch(`${appConfig.BASE_URL}api/`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/sellers/sitemap`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/products/sitemap`, { cache: "no-store" }),
    ]);

    if (homeRes.ok) {
      const homeData = await homeRes.json();
      categories = (homeData.productCategories || []).map((cat) => ({
        url: `${baseUrl}/products?category=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }

    if (sellersRes.ok) {
      const sellersData = await sellersRes.json();
      sellerEntries = (sellersData?.sellers || []).map((seller) => ({
        url: `${baseUrl}/seller/${seller.slug}`,
        lastModified: seller.updated_at ? new Date(seller.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }

    if (productsRes.ok) {
        const productsData = await productsRes.json();
        productEntries = (productsData?.products || [])
          .filter((product) => product.slug !== "test-urunu-5-tl")
          .map((product) => ({
            url: buildProductUrl(baseUrl, product.slug),
            lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
          }));
    }
  } catch (error) {
    // sitemap generation failed silently
  }

  return [...routes, ...categories, ...sellerEntries, ...productEntries];
}
