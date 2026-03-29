import getBlogCategoryDetails from "@/api/getBlogCategoryDetails";
import BlogCategoryPage from "@/components/Blog/BlogCategoryPage";
import { cache } from "react";
import { permanentRedirect } from "next/navigation";

export async function generateStaticParams() {
  return [];
}

export const revalidate = 300;

const getBlogCategoryDetailsData = cache(async (slug) => {
  return await getBlogCategoryDetails(slug);
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogCategoryDetailsData(slug);
  const { category } = data;

  return {
    title: category?.name ? `${category.name} Blog Yazilari` : "Blog Kategorisi",
    description: category?.name
      ? `${category.name} kategorisindeki blog yazilarini inceleyin.`
      : "Blog kategorisindeki yazilari inceleyin.",
    alternates: {
      canonical: `/category-by-blogs/${category?.slug || slug}`,
    },
  };
}

export default async function BlogCategoryDetailsPage({ params }) {
  const { slug } = await params;
  const data = await getBlogCategoryDetailsData(slug);
  const canonicalSlug = data?.category?.slug;

  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`/category-by-blogs/${canonicalSlug}`);
  }

  return (
    <BlogCategoryPage
      category={data?.category}
      blogs={data?.blogs || []}
      latestBlogs={data?.latestBlogs || []}
      popularPosts={data?.popularPosts || []}
      categories={data?.categories || []}
    />
  );
}
