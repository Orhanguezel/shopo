import appConfig from "@/appConfig";
import { isPlaceholderBlogContent } from "@/utils/contentAudit";
import { buildProductUrl } from "@/utils/url";

const baseUrl = appConfig.APPLICATION_URL || "https://seyfibaba.com";

export default async function sitemap() {
  const routes = [
    "", "/products", "/about", "/contact", "/faq",
    "/terms-condition", "/privacy-policy", "/sellers",
    "/flash-sale", "/blogs",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  let categories = [];
  let blogEntries = [];
  let blogCategoryEntries = [];
  let sellerEntries = [];
  let productEntries = [];

  try {
    const [homeRes, blogsRes, blogCatRes, sellersRes, productsRes] = await Promise.all([
      fetch(`${appConfig.BASE_URL}api/`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/blogs`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/blog-category`, { cache: "no-store" }),
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

    if (blogsRes.ok) {
      const blogsData = await blogsRes.json();
      blogEntries = (blogsData?.blogs || [])
        .filter((blog) => !isPlaceholderBlogContent(blog))
        .map((blog) => ({
          url: `${baseUrl}/blogs/${blog.slug}`,
          lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    }

    if (blogCatRes.ok) {
      const catData = await blogCatRes.json();
      blogCategoryEntries = (catData?.categories || []).map((category) => ({
        url: `${baseUrl}/category-by-blogs/${category.slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
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
    console.error("Sitemap generation error:", error);
  }

  return [...routes, ...categories, ...sellerEntries, ...blogEntries, ...blogCategoryEntries, ...productEntries];
}
