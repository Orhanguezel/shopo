import Image from "next/image";
import Link from "next/link";
import appConfig from "@/appConfig";

const IMAGE_FALLBACK = "/assets/images/server-error.png";

function formatBlogDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch (error) {
    return "";
  }
}

export default function BlogCard({ blog }) {
  const imageUrl = blog?.image
    ? `${appConfig.BASE_URL}${blog.image}`
    : IMAGE_FALLBACK;

  return (
    <article className="overflow-hidden rounded border border-qgray-border bg-white">
      <Link href={`/blogs/${blog?.slug || ""}`} className="block">
        <div className="relative h-[240px] w-full">
          <Image
            fill
            src={imageUrl}
            alt={blog?.title || "Blog gorseli"}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </Link>
      <div className="p-6">
        {blog?.category?.slug && (
          <Link
            href={`/category-by-blogs/${blog.category.slug}`}
            className="mb-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-qyellow"
          >
            {blog.category.name}
          </Link>
        )}
        <Link href={`/blogs/${blog?.slug || ""}`} className="block">
          <h2 className="mb-3 text-2xl font-semibold text-qblack transition-colors hover:text-qyellow">
            {blog?.title}
          </h2>
        </Link>
        <div className="mb-4 flex items-center justify-between text-sm text-qgray">
          <span>{formatBlogDate(blog?.created_at)}</span>
          <span>{blog?.views || 0} okunma</span>
        </div>
        {blog?.description && (
          <div
            className="blog details line-clamp-4 text-sm text-qgray"
            dangerouslySetInnerHTML={{
              __html: blog.description,
            }}
          />
        )}
      </div>
    </article>
  );
}
