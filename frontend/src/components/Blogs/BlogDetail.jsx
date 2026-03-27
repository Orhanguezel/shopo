"use client";

import { useGetBlogDetailQuery, useSubmitBlogCommentMutation } from "@/redux/features/blogs/apiSlice";
import Breadcrumb from "../Breadcrumb";
import Sidebar from "./Sidebar";
import Image from "next/image";
import { format } from "date-fns";
import Loader from "../Helpers/Loader";
import { useState } from "react";
import { toast } from "react-toastify";

export default function BlogDetail({ slug }) {
  const { data, isLoading, isError } = useGetBlogDetailQuery(slug);
  const [submitComment, { isLoading: submitting }] = useSubmitBlogCommentMutation();
  const [formData, setFormData] = useState({ name: "", email: "", comment: "" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (isLoading) return <Loader />;
  if (isError || !data?.blog) return <div className="py-20 text-center">Blog post not found.</div>;

  const { blog, relatedBlogs, categories } = data;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitComment({ ...formData, blog_id: blog.id, slug }).unwrap();
      toast.success("Comment submitted for review!");
      setFormData({ name: "", email: "", comment: "" });
    } catch (err) {
      toast.error("Failed to submit comment.");
    }
  };

  return (
    <>
      <Breadcrumb 
        title={blog.title}
        paths={[{ name: "Home", path: "/" }, { name: "Blogs", path: "/blogs" }, { name: blog.title, path: `/blogs/${slug}` }]}
      />
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8 md:p-12 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-2xl shadow-black/10">
                  <Image
                    src={blog.image ? `${baseUrl}${blog.image}` : `${baseUrl}${blog.thumb_image}`}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {blog.admin?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400">Author</span>
                      <span className="text-gray-900 font-bold">{blog.admin?.name || "Admin"}</span>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400">Published</span>
                    <time className="text-gray-900 font-bold">{format(new Date(blog.created_at), "MMMM d, yyyy")}</time>
                  </div>
                  <div className="w-px h-10 bg-gray-100 hidden md:block" />
                  <div className="hidden md:flex flex-col">
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400">Category</span>
                    <span className="text-primary font-bold">{blog.category?.name}</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                  {blog.title}
                </h1>

                <div 
                  className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-primary prose-img:rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                />

                {/* Share Buttons */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-center gap-4">
                  <span className="text-sm font-bold text-gray-900 mr-2 uppercase tracking-widest">Share this via:</span>
                  {[
                    { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", color: "#1877F2" },
                    { name: "Twitter", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z", color: "#1DA1F2" },
                    { name: "LinkedIn", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-7a2 2 0 110 4 2 2 0 010-4z", color: "#0A66C2" }
                  ].map((social) => (
                    <button 
                      key={social.name}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
                      style={{ backgroundColor: social.color }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d={social.icon} />
                      </svg>
                    </button>
                  ))}
                </div>
              </article>

              {/* Related Posts */}
              {relatedBlogs?.length > 0 && (
                <div className="mb-20">
                  <h3 className="text-2xl font-bold font-heading text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-primary rounded-full" />
                    Recommended for You
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {relatedBlogs.map((rBlog) => (
                      <div key={rBlog.id} className="group bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                          <Image
                            src={rBlog.thumb_image ? `${baseUrl}${rBlog.thumb_image}` : "/assets/images/placeholder-blog.jpg"}
                            alt={rBlog.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 px-2 pb-2">
                          {rBlog.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <h3 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3 relative">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Leave a Response
                  <span className="text-sm font-normal text-gray-500 ml-2">({blog.active_comments?.length || 0} reviews)</span>
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                        placeholder="e.g. john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Message</label>
                    <textarea
                      required
                      rows="6"
                      className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300 resize-none"
                      placeholder="Write your thoughts here..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group bg-primary text-white font-bold py-4 px-10 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 flex items-center gap-3 active:scale-95"
                  >
                    {submitting ? "Sending..." : "Post Comment"}
                    {!submitting && (
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
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
