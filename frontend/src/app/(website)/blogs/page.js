import BlogList from "@/components/Blogs/BlogList";
import JsonLd, { generateBlogItemListSchema } from "@/components/Helpers/JsonLd";
import getBlogs from "@/api/blogs";
import { cache } from "react";

const getBlogsData = cache(async () => {
  return await getBlogs();
});

export const metadata = {
  title: "Blog | Seyfibaba",
  description: "Berber ve kuafor ekipmanlari, salon kurulumu, urun secimi ve profesyonel isletme yonetimi hakkinda guncel blog yazilarini okuyun.",
  openGraph: {
    title: "Blog | Seyfibaba",
    description: "Berber ve kuafor ekipmanlari, salon kurulumu, urun secimi ve profesyonel isletme yonetimi hakkinda guncel blog yazilarini okuyun.",
    type: "website",
  },
  alternates: {
    canonical: "/blogs",
  },
};

export default async function BlogsPage() {
  const data = await getBlogsData();
  const blogItemListSchema = generateBlogItemListSchema(data?.blogs?.data || data?.blogs || []);

  return (
    <>
      <JsonLd data={blogItemListSchema} />
      <BlogList />
    </>
  );
}
