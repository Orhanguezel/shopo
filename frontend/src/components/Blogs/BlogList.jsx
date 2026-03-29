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

  const blogs = Array.isArray(data?.blogs?.data)
    ? data.blogs.data
    : Array.isArray(data?.blogs)
      ? data.blogs
      : [];
  const meta = data?.blogs || {};
  const totalPages = Number(meta?.last_page || 1);

  return (
    <>
      <BreadcrumbCom
        paths={[{ name: "Anasayfa", path: "/" }, { name: "Blog", path: "/blogs" }]}
      />
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="mb-10 rounded-3xl border border-[#e7dcc4] bg-white px-8 py-8 shadow-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#9f7b2f]">
                  Seyfibaba Editor Blogu
                </p>
                <h1 className="mb-3 text-3xl font-bold text-gray-900">
                  Berber ve Kuafor Profesyonelleri Icin Rehber Icerikler
                </h1>
                <p className="text-sm leading-7 text-gray-600">
                  Bu sayfada berber koltugu secimi, kuafor salon kurulumu, ekipman bakimi,
                  sarf malzeme yonetimi ve profesyonel urun karsilastirmalari gibi konularda
                  yayinlanan rehber yazilari bulabilirsiniz.
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  Icerikler Seyfibaba editor ekibi tarafindan, sektorde en sik aranan urun ve
                  salon ihtiyac basliklari dikkate alinerek hazirlanir. Liste duzenli olarak yeni
                  kategori ve urun trendleriyle guncellenir.
                </p>
              </div>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Yazi bulunamadi</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">Secili filtrelere uygun bir blog yazisi bulunamadi. Daha sonra tekrar kontrol edebilirsiniz.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
