"use client";

import { useGetBlogsQuery } from "@/redux/features/blogs/apiSlice";
import BlogCard from "./BlogCard";
import BreadcrumbCom from "../BreadcrumbCom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";

export default function BlogList({ categorySlug }) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError } = useGetBlogsQuery({
    page: currentPage,
    category: categorySlug,
  });

  if (isLoading) return <div className="flex justify-center py-20"><LoaderStyleOne /></div>;

  const blogs = data?.blogs?.data || [];
  const meta = data?.blogs || {};

  return (
    <>
      <BreadcrumbCom
        paths={[{ name: "Home", path: "/" }, { name: "Blogs", path: "/blogs" }]}
      />
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs found</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">We couldn't find any blog posts matching your criteria. Please check back later.</p>
                </div>
              )}

              {meta.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        currentPage === page
                          ? "bg-qyellow text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/3">
              <Sidebar />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
