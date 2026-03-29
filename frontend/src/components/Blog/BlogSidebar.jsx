import Link from "next/link";

function SidebarSection({ title, children }) {
  return (
    <div className="rounded border border-qgray-border bg-white p-6">
      <h3 className="mb-5 text-lg font-semibold text-qblack">{title}</h3>
      {children}
    </div>
  );
}

export default function BlogSidebar({
  latestBlogs = [],
  popularPosts = [],
  categories = [],
}) {
  return (
    <div className="space-y-6">
      <SidebarSection title="Son Yazilar">
        <div className="space-y-4">
          {latestBlogs.length > 0 ? (
            latestBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="block border-b border-qgray-border pb-4 last:border-b-0 last:pb-0"
              >
                <p className="mb-1 text-sm text-qgray">
                  {blog.category?.name || "Blog"}
                </p>
                <p className="font-medium text-qblack transition-colors hover:text-qyellow">
                  {blog.title}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-qgray">Henuz yazi bulunmuyor.</p>
          )}
        </div>
      </SidebarSection>

      <SidebarSection title="Populer Yazilar">
        <div className="space-y-4">
          {popularPosts.length > 0 ? (
            popularPosts.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="flex items-center justify-between border-b border-qgray-border pb-4 last:border-b-0 last:pb-0"
              >
                <p className="pr-4 font-medium text-qblack transition-colors hover:text-qyellow">
                  {blog.title}
                </p>
                <span className="shrink-0 text-sm text-qgray">
                  {blog.views || 0}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-qgray">Populer yazi verisi henuz olusmadi.</p>
          )}
        </div>
      </SidebarSection>

      <SidebarSection title="Kategoriler">
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/category-by-blogs/${category.slug}`}
                className="flex items-center justify-between text-sm text-qblack transition-colors hover:text-qyellow"
              >
                <span>{category.name}</span>
                <span className="text-qgray">{category.blogs_count || 0}</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-qgray">Kategori bulunmuyor.</p>
          )}
        </div>
      </SidebarSection>
    </div>
  );
}
