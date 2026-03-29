import PageTitle from "../Helpers/PageTitle";
import BlogCard from "./BlogCard";
import BlogSidebar from "./BlogSidebar";

const categoryEditorialCopy = {
  guide: {
    title: "Satın Alma ve Kurulum Rehberleri",
    description:
      "Bu kategori; salon kurulumuna hazırlanan işletmelerin, ekipman yenilemek isteyen profesyonellerin ve ürün karşılaştırması yapmak isteyen satın alma ekiplerinin daha bilinçli karar verebilmesi için hazırlanır. Berber koltuğu, kuaför tezgahı, saç bakım cihazları ve yardımcı salon ekipmanları gibi başlıklarda teknik kriterler, kullanım senaryoları ve bütçe planlaması birlikte ele alınır.",
  },
  inspiration: {
    title: "Salon Tasarımı ve İlham İçerikleri",
    description:
      "İlham odaklı içerikler; salon dekorasyonu, müşteri deneyimi, ekipman yerleşimi ve hizmet akışı gibi başlıklarda işletmelere fikir vermeyi amaçlar. Estetik görünüm ile operasyonel verimliliği aynı çatı altında değerlendiren bu yazılar, yeni konsept arayan kuaför ve berber işletmeleri için pratik referans oluşturur.",
  },
  revenue: {
    title: "Operasyon, Verimlilik ve Büyüme",
    description:
      "Bu bölümde ürün seçimi kadar iş yönetimi de odağa alınır. Stok planlama, hizmet standardizasyonu, ekipman ömrünü uzatma, maliyet kontrolü ve salon kapasitesini daha verimli kullanma gibi başlıklarda profesyonellere yol gösteren içerikler yer alır.",
  },
};

export default function BlogCategoryPage({
  category,
  blogs = [],
  latestBlogs = [],
  popularPosts = [],
  categories = [],
}) {
  const editorialBlock =
    categoryEditorialCopy[category?.slug] || {
      title: `${category?.name || "Bu kategori"} için sektör içerikleri`,
      description:
        "Bu kategori altındaki içerikler; ürün seçimi, salon yönetimi, ekipman kullanımı ve profesyonel satın alma süreçlerinde daha hızlı karar verebilmeniz için düzenli olarak derlenir.",
    };

  return (
    <div className="w-full bg-white pb-[60px]">
      <PageTitle
        title={category?.name || "Blog Kategorisi"}
        breadcrumb={[
          { name: "home", path: "/" },
          { name: "blog kategorileri", path: "/category-by-blogs/" },
          {
            name: category?.name || "kategori",
            path: `/category-by-blogs/${category?.slug || ""}`,
          },
        ]}
      />

      <div className="container-x mx-auto mt-[60px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mb-8 rounded border border-qgray-border bg-qyellowlow/10 p-6">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-qyellow">
                Blog Kategorisi
              </p>
              <h1 className="mb-2 text-3xl font-semibold text-qblack">
                {category?.name}
              </h1>
              <p className="text-qgray">
                Bu kategoride {blogs.length} yazi bulunuyor.
              </p>
              <p className="mt-3 text-sm leading-7 text-qgray">
                {category?.name || "Bu kategori"} altindaki icerikler; urun secimi,
                salon yonetimi, profesyonel kullanim senaryolari ve satin alma sureclerinde
                daha hizli karar vermenize yardimci olacak sekilde derlenir.
              </p>
              <div className="mt-5 rounded-2xl border border-[#e9dfc8] bg-white px-5 py-4">
                <h2 className="text-lg font-semibold text-qblack">
                  {editorialBlock.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-qgray">
                  {editorialBlock.description}
                </p>
              </div>
            </div>

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="rounded border border-dashed border-qgray-border p-10 text-center text-qgray">
                Bu kategoride henuz yazi bulunmuyor.
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
