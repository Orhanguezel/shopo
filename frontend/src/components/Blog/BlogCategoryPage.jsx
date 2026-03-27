import PageTitle from "../Helpers/PageTitle";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";

export default function BlogCategoryPage({
  category,
  blogs = [],
  latestBlogs = [],
  popularPosts = [],
  categories = [],
}) {
  return (
    <div className="w-full bg-white pb-[60px]">
      <PageTitle
        title={category?.name || "Blog Category"}
        breadcrumb={[
          { name: "home", path: "/" },
          { name: "blog categories", path: "/category-by-blogs/" },
          {
            name: category?.name || "category",
            path: `/category-by-blogs/${category?.slug || ""}`,
          },
        ]}
      />

      <div className="container-x mx-auto mt-[60px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mb-8 rounded border border-qgray-border bg-qyellowlow/10 p-6">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-qyellow">
                Blog Category
              </p>
              <h1 className="mb-2 text-3xl font-semibold text-qblack">
                {category?.name}
              </h1>
              <p className="text-qgray">
                {blogs.length} post{blogs.length === 1 ? "" : "s"} available in
                this category.
              </p>
            </div>

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="rounded border border-dashed border-qgray-border p-10 text-center text-qgray">
                No posts were found in this category.
              </div>
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
