import BlogList from "@/components/Blogs/BlogList";

export const metadata = {
  title: "Blog | Seyfibaba",
  description: "E-ticaret, alışveriş ipuçları ve pazaryeri trendleri hakkında en güncel makaleleri okuyun.",
  openGraph: {
    title: "Blog | Seyfibaba",
    description: "E-ticaret, alışveriş ipuçları ve pazaryeri trendleri hakkında en güncel makaleleri okuyun.",
    type: "website",
  },
  alternates: {
    canonical: "/blogs",
  },
};

export default function BlogsPage() {
  return <BlogList />;
}
