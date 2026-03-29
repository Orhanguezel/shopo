import getBlogDetails from "@/api/getBlogDetails";
import BlogDetails from "@/components/Blog/BlogDetails";
import { cache } from "react";
import JsonLd, {
  generateBlogPostingSchema,
} from "@/components/Helpers/JsonLd";
import { isPlaceholderBlogContent } from "@/utils/contentAudit";
import { permanentRedirect } from "next/navigation";

export async function generateStaticParams() {
  return [];
}

export const revalidate = 300;

const getBlogDetailsData = cache(async (slug) => {
  return await getBlogDetails(slug);
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogDetailsData(slug);
  const { blog } = data;
  const isPlaceholder = isPlaceholderBlogContent(blog);

  return {
    title: blog?.seo_title || blog?.title,
    description: blog?.seo_description || blog?.title,
    robots: isPlaceholder
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    alternates: {
      canonical: `/blogs/${blog?.slug || slug}`,
    },
  };
}

export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;
  const data = await getBlogDetailsData(slug);
  const canonicalSlug = data?.blog?.slug;

  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`/blogs/${canonicalSlug}`);
  }

  const blogPostingSchema = generateBlogPostingSchema(data?.blog);

  return (
    <>
      {blogPostingSchema && <JsonLd data={blogPostingSchema} />}
      <BlogDetails
        blog={data?.blog}
        relatedBlogs={data?.relatedBlogs || []}
        latestBlogs={data?.latestBlogs || []}
        popularPosts={data?.popularPosts || []}
        categories={data?.categories || []}
      />
    </>
  );
}
