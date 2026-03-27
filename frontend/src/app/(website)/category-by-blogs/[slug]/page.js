import getBlogCategoryDetails from "@/api/getBlogCategoryDetails";
import BlogCategoryPage from "@/components/Blog/BlogCategoryPage";
import { cache } from "react";

export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";

const getBlogCategoryDetailsData = cache(async (slug) => {
  return await getBlogCategoryDetails(slug);
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogCategoryDetailsData(slug);
  const { category } = data;

  return {
    title: category?.name ? `${category.name} Blogs` : "Blog Category",
    description: category?.name
      ? `Browse articles in the ${category.name} category.`
      : "Browse blog category articles.",
    alternates: {
      canonical: `/category-by-blogs/${slug}`,
    },
  };
}

export default async function BlogCategoryDetailsPage({ params }) {
  const { slug } = await params;
  const data = await getBlogCategoryDetailsData(slug);

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
