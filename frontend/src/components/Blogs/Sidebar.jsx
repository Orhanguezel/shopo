"use client";

import { useGetBlogCategoryQuery, useGetBlogsQuery } from "@/redux/features/blogs/apiSlice";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import Loader from "../Helpers/Loader";

export default function Sidebar() {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBlogCategoryQuery();
  const { data: popularBlogsData, isLoading: popularBlogsLoading } = useGetBlogsQuery({ popular: 1, limit: 5 });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (categoriesLoading || popularBlogsLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading sidebar...</div>;

  const categories = categoriesData?.categories || [];
  const popularBlogs = popularBlogsData?.blogs?.data || [];

  return (
    <div className="space-y-12 shrink-0 sticky top-24">
      {/* Search Widget */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Articles
        </h4>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full bg-gray-50 border-0 rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
          />
          <button className="absolute right-2 top-2 bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Categories Widget */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden">
        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Categories
        </h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category-by-blogs/${cat.slug}`}
              className="flex items-center justify-between group p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
                <span className="text-gray-600 font-medium group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </div>
              <span className="bg-gray-100 text-gray-500 text-[10px] px-2.5 py-1 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all">
                {cat.blogs_count || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Posts Widget */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h4 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Recent Posts
        </h4>
        <div className="space-y-8">
          {popularBlogs.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`} className="flex items-start gap-4 group">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                <Image
                  src={blog.thumb_image ? `${baseUrl}${blog.thumb_image}` : "/assets/images/placeholder-blog.jpg"}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                  {format(new Date(blog.created_at), "MMM d, yyyy")}
                </span>
                <h5 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h5>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
