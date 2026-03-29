import getBlogDetails from "@/api/getBlogDetails";
import appConfig from "@/appConfig";
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
  const canonicalSlug = blog?.slug || slug;
  const title = blog?.seo_title || blog?.title;
  const description = blog?.seo_description || blog?.title;
  const imagePath = blog?.image || blog?.thumb_image;
  const imageUrl = imagePath
    ? imagePath.startsWith?.("http")
      ? imagePath
      : `${appConfig.BASE_URL}${imagePath}`
    : appConfig.BASE_URL + "uploads/website-images/logo-2025-12-18-04-53-36-7704.png";

  return {
    title,
    description,
    robots: isPlaceholder
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    alternates: {
      canonical: `/blogs/${canonicalSlug}`,
    },
    openGraph: {
      type: "article",
      siteName: "Seyfibaba",
      title,
      description,
      url: `${appConfig.APPLICATION_URL}/blogs/${canonicalSlug}`,
      locale: "tr_TR",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog?.title || "Seyfibaba Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@seyfibaba",
      title,
      description,
      images: [imageUrl],
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
