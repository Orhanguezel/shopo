const categoryBlocks = [
  {
    title: "Profesyonel Erkek Kuaför Malzemeleri",
    description:
      "Modern erkek kuaför salonları için doğru ekipman seçimi, hizmet kalitesini ve müşteri memnuniyetini doğrudan etkileyen en temel unsurdur. Seyfibaba pazar yerinde sunulan profesyonel erkek kuaför malzemeleri grubunda tıraş makineleri, enseden temizleme aparatları, farklı inç boyutlarında makas setleri, yüksek devirli fön makineleri ve hijyenik havlu ısıtıcı üniteleri gibi geniş bir ürün gamı yer alır. Berberler çok yoğun bir tempoda çalıştıkları için ürünlerde dayanıklılık, kolay temizlenebilir metal veya polimer yüzeyler ve yetkili servise/yedek parçaya hızlı erişim ön planda tutulur. Bu kategoriler, hem sıfırdan salon kuran işletmecilerin temel demirbaş ihtiyaçlarını hem de mevcut ekipmanlarını en yeni salon teknolojileriyle yenilemek isteyen kıdemli profesyonellerin her türlü talebini karşılayacak teknik özellikler ve garanti standartları ile donatılmıştır.",
    highlights: [
      "Tiraş makineleri, makas setleri ve yardimci el aletleri",
      "Günlük yoğun kullanıma uygun dayanıklılık kriterleri",
      "Salon açılışı ve ekipman yenileme senaryoları",
    ],
  },
  {
    title: "Kuaför Tezgahı ve Salon Mobilyaları",
    description:
      "Standart bir kuaför tezgahı, aynalı üniteler, fonksiyonel çekmeceli modüller ve ergonomik bekleme koltukları, bir salonun mimari düzenini ve çalışma akışını belirleyen ana bileşenlerdir. Seyfibaba platformu üzerinden salon tasarımınıza en uygun modern, klasik, endüstriyel veya kompakt mobilya çözümlerini teknik detaylarıyla karşılaştırabilir; ürünleri salonunuzun fiziksel ölçülerine, kurumsal renk seçeneklerine ve günlük kullanım yoğunluğuna göre filtreleyerek inceleyebilirsiniz. Kaliteli bir kuaför mobilyası seçilirken sadece estetik görünüme değil, aynı zamanda uzun ömürlü mekanik aksam, kolay montaj avantajı ve kimyasal sıvılara karşı dayanıklı yüzey yapısı gibi unsurlara dikkat edilmelidir. Bu bölümde, profesyonel salon ekipmanı arayan işletmeler için işlevsel konfor ile premium estetik dengesini kusursuz şekilde koruyan yerli ve ithal marka alternatifleri öne çıkmaktadır.",
    highlights: [
      "Aynali tezgah, bekleme koltugu ve depolama cozumleri",
      "Salon metrekarelerine uygun yerlesim planlari",
      "Estetik ve operasyonel verimliligi birlikte destekleyen modeller",
    ],
  },
  {
    title: "Salon Ekipmanları ve Berber Koltuğu Modelleri",
    description:
      "Berber koltuğu ve bütünleşik salon ekipmanları, müşterinin işletme hakkındaki ilk izlenimini oluşturan en prestijli ürün grupları arasında yer alır. Yüksek performanslı hidrolik sistemler, çok açılı sırt ayar mekanizmaları, ayarlanabilir ayak destekleri ve leke tutmayan suni deri döşeme kalitesi gibi teknik detaylar hem çalışan ergonomisini hem de sunulan hizmetin profesyonellik algısını ciddi oranda güçlendirir. Seyfibaba, üst segment profesyonel berber koltuğu modellerinden seramik başlıklı saç yıkama setlerine, UV sterilizasyon cihazlarından çok fonksiyonlu servis arabalarına kadar salonun her departmanına hitap eden donanımları tek bir güvenli çatı altında toplar. Bu sayede işletme sahipleri, kendi bütçe ve salon hacmi dengesine göre en ideal ürün kombinasyonunu oluşturabilir ve lojistik süreçleri tek bir noktadan yöneterek operasyonel verimlilik sağlayabilirler.",
    highlights: [
      "Hidrolik koltuk, yikama seti ve sterilizasyon ekipmanlari",
      "Musteri deneyimini guclendiren premium urun gruplari",
      "Butce ve salon hacmine gore kombinlenebilen cozumler",
    ],
  },
];

const operationalChecklist = [
  {
    title: "Salon kurulumu",
    description:
      "Yeni açılacak işletmelerde öncelik, hizmet verilecek istasyon sayısına göre zorunlu demirbaşları çıkarmaktır. Berber koltuğu, tezgah, ayna, yıkama seti ve temel elektrikli cihazlar ilk yatırım kalemidir.",
  },
  {
    title: "Ekipman yenileme",
    description:
      "Aktif salonlarda ürün yenilerken eski ekipmanın servis geçmişi, yedek parça bulunabilirliği ve günlük kullanım sıklığı birlikte değerlendirilmelidir. Yalnızca fiyat odaklı seçimler kısa sürede ikinci maliyet doğurabilir.",
  },
  {
    title: "Sarf ve tekrarli tedarik",
    description:
      "Havlu, boya yardımcıları, hijyen ürünleri ve bakım sarfları gibi hızlı tükenen gruplarda stok sürekliliği kritik olduğu için satıcı güvenilirliği ve sevkiyat hızı öne çıkar.",
  },
];

export default function CategoryDescriptions() {
  return (
    <section
      aria-labelledby="category-descriptions-heading"
      className="container-x mx-auto"
    >
      <div className="rounded-[32px] bg-white px-6 py-10 shadow-sm ring-1 ring-[#f1eadc] md:px-10 md:py-14">
        <div className="mb-10 max-w-3xl">
          <h2
            id="category-descriptions-heading"
            className="text-3xl font-black text-[#1f2937] md:text-4xl"
          >
            Profesyoneller İçin Kategori Rehberi
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-[#4b5563] md:text-base">
            Berber, kuaför ve güzellik salonları için ürün seçerken ekipmanın
            dayanıklılığı, servis kolaylığı ve günlük operasyonlara uyumu en az
            fiyat kadar önemlidir. Bu rehber alanında en çok aranan kategori ve
            ekipman gruplarını daha okunabilir bir yapıyla özetler.
          </p>
          <p className="mt-4 text-[15px] leading-8 text-[#4b5563] md:text-base">
            Seyfibaba, farklı satıcıları aynı pazaryeri akışında bir araya
            getirerek salon sahiplerinin ürünleri tek tek mağaza dolaşmadan
            karşılaştırmasına yardımcı olur. Bu yüzden kategori sayfalarında
            yalnızca ürün listesi değil; hangi ekipmanın hangi kullanım
            senaryosuna daha uygun olduğuna dair karar destek metinleri de yer
            alır.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {categoryBlocks.map((block) => (
            <article
              key={block.title}
              className="rounded-3xl bg-[#fffaf0] p-6 ring-1 ring-[#eee0be]"
            >
              <h3 className="text-2xl font-bold text-[#22223b]">
                {block.title}
              </h3>
              <p className="mt-4 text-[15px] leading-8 text-[#4b5563]">
                {block.description}
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-7 text-[#4b5563]">
                {block.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[#9f7b2f]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-[28px] bg-[#1f2937] px-6 py-8 text-white md:px-8">
          <h3 className="text-2xl font-bold">
            Satin alma kararinda en cok sorulan uc senaryo
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {operationalChecklist.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl bg-white/8 px-5 py-5 ring-1 ring-white/10"
              >
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
