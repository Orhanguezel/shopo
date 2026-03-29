import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

export default function BlogCard({ blog }) {
  const { title, slug, thumb_image, created_at, admin, comments_count } = blog;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link href={`/blogs/${slug}`}>
          <Image
            src={thumb_image ? `${baseUrl}${thumb_image}` : "/assets/images/placeholder-blog.jpg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-all duration-500"
          />
        </Link>
        <div className="absolute top-4 left-4">
          <span className="bg-primary px-3 py-1 rounded-full text-white text-xs font-semibold shadow-lg">
            {blog.category?.name || "Genel"}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 text-gray-500 text-xs mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {created_at ? format(new Date(created_at), "MMM dd, yyyy") : ""}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            {comments_count || 0} Yorum
          </div>
        </div>
        <Link href={`/blogs/${slug}`}>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
          {blog.short_description || blog.description?.replace(/<[^>]*>?/gm, "").substring(0, 150)}
        </p>
        <Link 
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-2 text-primary font-bold text-sm group/btn"
        >
          Devamini Oku
          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
