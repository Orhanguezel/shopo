import { useMemo } from "react";
import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";
import BlogCard from "@/components/Helpers/Cards/BlogCard";
import DataIteration from "@/components/Helpers/DataIteration";

/* === RTK Query === */
import { useListPublicNewsQuery } from "@/api-manage/api-call-functions/public/publicNews.api";

/* i18n (merkezi dil) */
import { useT } from "@/i18n/I18nProvider";

/* Çok-dilli obje -> aktif locale string (fallback YOK) */
const pickStrict = (val, lang) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  if (typeof val === "object") return typeof val?.[lang] === "string" ? val[lang] : "";
  return String(val);
};

export default function Blogs() {
  const { lang } = useT();

  // İleride sayfalama route paramlarına bağlanabilir.
  const { data, isLoading, isError } = useListPublicNewsQuery({
    page: 1,
    limit: 24,
    onlyLocalized: true,
  });

  // API -> BlogCard’ın beklediği shape’e dönüştür
  const newsItems = useMemo(() => {
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map((n) => {
      const img =
        n?.image?.url ||
        n?.images?.[0]?.url ||
        (typeof n?.images?.[0] === "string" ? n.images[0] : null) ||
        `${import.meta.env.VITE_PUBLIC_URL || ""}/assets/images/blog-1.png`;

      // BlogCard içinde link verilecekse datas.slug kullanılıyor:
      // örn: <Link to={`/blogs/${datas.slug}`}>...
      const slug = (typeof n?.slug === "object" ? n?.slug?.[lang] : n?.slug) || "";

      return {
        id: n?._id || n?.id,
        img,
        title: pickStrict(n?.title, lang) || "",
        shortDesc: pickStrict(n?.summary, lang) || "",
        date: n?.publishedAt || n?.createdAt || "",
        slug,
      };
    });
  }, [data, lang]);

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="blogs-wrapper w-full-width">
        <div className="title-bar">
          <PageTitle
            title="Our Blogs"
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "blogs", path: "/blogs" },
            ]}
          />
        </div>
      </div>

      <div className="w-full py-[60px]">
        <div className="container-x mx-auto">
          <div className="w-full">
            {isLoading && (
              <div className="bg-white p-6 border border-qgray-border rounded mb-5 text-qgray">
                Loading…
              </div>
            )}
            {isError && (
              <div className="bg-white p-6 border border-qgray-border rounded mb-5 text-qgray">
                Couldn’t load blogs. Please try again.
              </div>
            )}
            {!isLoading && !isError && (
              <div className="grid md:grid-cols-2 grid-cols-1 lg:gap-[30px] gap-5">
                <DataIteration
                  datas={newsItems}
                  startLength={0}
                  endLength={newsItems.length}
                >
                  {({ datas }) => (
                    <div data-aos="fade-up" key={datas.id} className="item w-full">
                      <BlogCard datas={datas} />
                    </div>
                  )}
                </DataIteration>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
