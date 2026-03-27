import getBlogDetails from "@/api/getBlogDetails";
import BlogDetails from "@/components/Blog/BlogDetails";
import { cache } from "react";

export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";

const getBlogDetailsData = cache(async (slug) => {
  return await getBlogDetails(slug);
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogDetailsData(slug);
  const { blog } = data;

  return {
    title: blog?.seo_title || blog?.title,
    description: blog?.seo_description || blog?.title,
    alternates: {
      canonical: `/blogs/${slug}`,
    },
  };
}

export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;
  const data = await getBlogDetailsData(slug);

  return (
    <BlogDetails
      blog={data?.blog}
      relatedBlogs={data?.relatedBlogs || []}
      latestBlogs={data?.latestBlogs || []}
      popularPosts={data?.popularPosts || []}
      categories={data?.categories || []}
    />
  );
}
