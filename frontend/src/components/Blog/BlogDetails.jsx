import Image from "next/image";
import Link from "next/link";
import PageTitle from "../Helpers/PageTitle";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";
import appConfig from "@/appConfig";
import { getBlogReadingTime } from "@/utils/contentAudit";

const IMAGE_FALLBACK = "/assets/images/server-error.png";

function formatBlogDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("tr-TR", {
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
  const readingTime = getBlogReadingTime(blog);
  const authorName = blog?.admin?.name || "Seyfibaba Editoru";
  const authorRole = "Berber ve kuafor ekipmanlari icerik editoru";
  const authorImage = blog?.admin?.image || blog?.admin?.provider_avatar;
  const authorImageUrl = authorImage
    ? authorImage.startsWith?.("http")
      ? authorImage
      : `${appConfig.BASE_URL}${authorImage}`
    : null;
  const authorInitial = authorName.charAt(0).toUpperCase();

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
                  alt={blog?.title || "Blog gorseli"}
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
                  <span>{blog?.views || 0} okunma</span>
                  <span>{readingTime} dakikalik okuma</span>
                </div>
                <div
                  id="author"
                  className="mb-6 rounded-2xl border border-[#efe7d6] bg-[#f8fafc] px-5 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f7b2f]">
                    Yazar Profili
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1f2937] text-lg font-semibold text-white">
                      {authorImageUrl ? (
                        <Image
                          fill
                          src={authorImageUrl}
                          alt={authorName}
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <span>{authorInitial}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-qblack">
                        {authorName}
                      </p>
                      <p className="text-sm text-qgray">{authorRole}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#9f7b2f]">
                        {formatBlogDate(blog?.created_at)}
                        {blog?.updated_at && blog?.updated_at !== blog?.created_at
                          ? ` • Guncelleme: ${formatBlogDate(blog?.updated_at)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-qgray">
                    Seyfibaba blog icerikleri, berber ve kuafor profesyonellerinin
                    ekipman secimi ile salon yonetimi kararlarini desteklemek
                    icin hazirlanir.
                  </p>
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
                    Ilgili Yazilar
                  </h2>
                  {blog?.category?.slug && (
                    <Link
                      href={`/category-by-blogs/${blog.category.slug}`}
                      className="text-sm font-medium text-qyellow"
                    >
                      Tumunu Gor
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
