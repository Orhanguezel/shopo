import Image from "next/image";
import Link from "next/link";
import PageTitle from "../Helpers/PageTitle";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";
import appConfig from "@/appConfig";

const IMAGE_FALLBACK = "/assets/images/server-error.png";

function formatBlogDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch (error) {
    return "";
  }
}

export default function BlogDetails({
  blog,
  relatedBlogs = [],
  latestBlogs = [],
  popularPosts = [],
  categories = [],
}) {
  const imageUrl = blog?.image
    ? `${appConfig.BASE_URL}${blog.image}`
    : IMAGE_FALLBACK;

  return (
    <div className="w-full bg-white pb-[60px]">
      <PageTitle
        title={blog?.title || "Blog"}
        breadcrumb={[
          { name: "home", path: "/" },
          { name: "blogs", path: "/blogs/" },
          { name: blog?.title || "blog", path: `/blogs/${blog?.slug || ""}` },
        ]}
      />

      <div className="container-x mx-auto mt-[60px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="overflow-hidden rounded border border-qgray-border bg-white">
              <div className="relative h-[420px] w-full">
                <Image
                  fill
                  src={imageUrl}
                  alt={blog?.title || "Blog image"}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              <div className="p-8">
                <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-qgray">
                  {blog?.category?.slug && (
                    <Link
                      href={`/category-by-blogs/${blog.category.slug}`}
                      className="font-semibold uppercase tracking-[0.2em] text-qyellow"
                    >
                      {blog.category.name}
                    </Link>
                  )}
                  <span>{formatBlogDate(blog?.created_at)}</span>
                  <span>{blog?.views || 0} views</span>
                </div>
                <div
                  className="blog details prose max-w-none text-qgray"
                  dangerouslySetInnerHTML={{
                    __html: blog?.description || "",
                  }}
                />
              </div>
            </div>

            {relatedBlogs.length > 0 && (
              <section className="mt-10">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-qblack">
                    Related Posts
                  </h2>
                  {blog?.category?.slug && (
                    <Link
                      href={`/category-by-blogs/${blog.category.slug}`}
                      className="text-sm font-medium text-qyellow"
                    >
                      View all
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {relatedBlogs.map((item) => (
                    <BlogCard key={item.id} blog={item} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <BlogSidebar
            latestBlogs={latestBlogs}
            popularPosts={popularPosts}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
