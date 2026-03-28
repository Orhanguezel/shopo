const categoryBlocks = [
  {
    title: "Profesyonel Erkek Kuaför Malzemeleri",
    description:
      "Modern erkek kuaför salonları için doğru ekipman seçimi, hizmet kalitesini ve müşteri memnuniyetini doğrudan etkileyen en temel unsurdur. Seyfibaba pazar yerinde sunulan profesyonel erkek kuaför malzemeleri grubunda tıraş makineleri, enseden temizleme aparatları, farklı inç boyutlarında makas setleri, yüksek devirli fön makineleri ve hijyenik havlu ısıtıcı üniteleri gibi geniş bir ürün gamı yer alır. Berberler çok yoğun bir tempoda çalıştıkları için ürünlerde dayanıklılık, kolay temizlenebilir metal veya polimer yüzeyler ve yetkili servise/yedek parçaya hızlı erişim ön planda tutulur. Bu kategoriler, hem sıfırdan salon kuran işletmecilerin temel demirbaş ihtiyaçlarını hem de mevcut ekipmanlarını en yeni salon teknolojileriyle yenilemek isteyen kıdemli profesyonellerin her türlü talebini karşılayacak teknik özellikler ve garanti standartları ile donatılmıştır.",
  },
  {
    title: "Kuaför Tezgahı ve Salon Mobilyaları",
    description:
      "Standart bir kuaför tezgahı, aynalı üniteler, fonksiyonel çekmeceli modüller ve ergonomik bekleme koltukları, bir salonun mimari düzenini ve çalışma akışını belirleyen ana bileşenlerdir. Seyfibaba platformu üzerinden salon tasarımınıza en uygun modern, klasik, endüstriyel veya kompakt mobilya çözümlerini teknik detaylarıyla karşılaştırabilir; ürünleri salonunuzun fiziksel ölçülerine, kurumsal renk seçeneklerine ve günlük kullanım yoğunluğuna göre filtreleyerek inceleyebilirsiniz. Kaliteli bir kuaför mobilyası seçilirken sadece estetik görünüme değil, aynı zamanda uzun ömürlü mekanik aksam, kolay montaj avantajı ve kimyasal sıvılara karşı dayanıklı yüzey yapısı gibi unsurlara dikkat edilmelidir. Bu bölümde, profesyonel salon ekipmanı arayan işletmeler için işlevsel konfor ile premium estetik dengesini kusursuz şekilde koruyan yerli ve ithal marka alternatifleri öne çıkmaktadır.",
  },
  {
    title: "Salon Ekipmanları ve Berber Koltuğu Modelleri",
    description:
      "Berber koltuğu ve bütünleşik salon ekipmanları, müşterinin işletme hakkındaki ilk izlenimini oluşturan en prestijli ürün grupları arasında yer alır. Yüksek performanslı hidrolik sistemler, çok açılı sırt ayar mekanizmaları, ayarlanabilir ayak destekleri ve leke tutmayan suni deri döşeme kalitesi gibi teknik detaylar hem çalışan ergonomisini hem de sunulan hizmetin profesyonellik algısını ciddi oranda güçlendirir. Seyfibaba, üst segment profesyonel berber koltuğu modellerinden seramik başlıklı saç yıkama setlerine, UV sterilizasyon cihazlarından çok fonksiyonlu servis arabalarına kadar salonun her departmanına hitap eden donanımları tek bir güvenli çatı altında toplar. Bu sayede işletme sahipleri, kendi bütçe ve salon hacmi dengesine göre en ideal ürün kombinasyonunu oluşturabilir ve lojistik süreçleri tek bir noktadan yöneterek operasyonel verimlilik sağlayabilirler.",
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
