import appConfig from "@/appConfig";

const baseUrl = "https://seyfibaba.com";

export async function generateSitemaps() {
  try {
    const res = await fetch(`${appConfig.BASE_URL}api/products/count`, {
      cache: "no-store",
    });
    if (!res.ok) return [{ id: 0 }];
    const data = await res.json();
    const pages = Math.ceil((data.count || 0) / 1000);
    // id 0 = static + categories + blogs, id 1+ = products batches
    return [{ id: 0 }, ...Array.from({ length: Math.max(pages, 1) }, (_, i) => ({ id: i + 1 }))];
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }) {
  // id 0: static pages + categories + blogs + sellers
  if (id === 0) {
    return await getStaticSitemap();
  }

  // id 1+: product pages (batched by 1000)
  return await getProductSitemap(id - 1);
}

async function getStaticSitemap() {
  // Static pages
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

  try {
    const [homeRes, blogsRes, blogCatRes, sellersRes] = await Promise.all([
      fetch(`${appConfig.BASE_URL}api/`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/blogs`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/blog-category`, { cache: "no-store" }),
      fetch(`${appConfig.BASE_URL}api/sellers/sitemap`, { cache: "no-store" }),
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
      blogEntries = (blogsData?.blogs || []).map((blog) => ({
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
  } catch {
    // Fail silently — return what we have
  }

  return [...routes, ...categories, ...sellerEntries, ...blogEntries, ...blogCategoryEntries];
}

async function getProductSitemap(page) {
  try {
    const res = await fetch(`${appConfig.BASE_URL}api/products/sitemap`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data.products || [];
    const start = page * 1000;
    const batch = products.slice(start, start + 1000);

    return batch.map((product) => ({
      url: `${baseUrl}/single-product?slug=${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch {
    return [];
  }
}
