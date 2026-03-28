import JsonLd, { generateFAQSchema } from "../Helpers/JsonLd";
import Accodion from "../Helpers/Accodion";

const faqItems = [
  {
    question: "Seyfibaba'da hangi berber ve kuaför malzemeleri bulunur?",
    answer:
      "Seyfibaba; berber koltuğu, kuaför tezgahı, tıraş makineleri, makas setleri, salon ekipmanları, sarf malzemeler ve farklı profesyonel marka ürünlerini bir arada sunar. Kategori yapısı, salon kurulumundan günlük tedarike kadar farklı ihtiyaçlara göre ilerlemeyi kolaylaştırır.",
  },
  {
    question: "Salonum için doğru ekipmanı nasıl seçebilirim?",
    answer:
      "Seçim yaparken ürünün kullanım yoğunluğu, malzeme kalitesi, teknik özellikleri, ölçüleri ve salonunuzun hizmet tipi birlikte değerlendirilmelidir. Berber koltuğu veya kuaför mobilyası gibi ürünlerde ergonomi, temizlik kolaylığı ve dayanıklılık uzun vadede daha belirleyicidir.",
  },
  {
    question: "Seyfibaba profesyonel kullanıcılar için uygun mu?",
    answer:
      "Evet. Platform, profesyonel berberler, kuaförler, güzellik merkezleri ve yeni salon kuran girişimciler için uygun ürün gruplarını bir araya getirir. Bu sayede hem tekli ürün arayanlar hem de toplu ekipman ihtiyacı olan işletmeler daha hızlı şekilde ilerleyebilir.",
  },
  {
    question: "Marka ve fiyat karşılaştırması yapabilir miyim?",
    answer:
      "Seyfibaba'da ürünler kategori ve marka bağlamında listelendiği için farklı seçenekleri karşılaştırmak daha kolaydır. Bu yapı, profesyonel kuaför ekipmanları ve salon malzemeleri için bütçeye uygun alternatifleri daha net görmenizi sağlar.",
  },
];

export default function HomeFAQ() {
  return (
    <section
      aria-labelledby="home-faq-heading"
      className="container-x mx-auto"
    >
      <JsonLd data={generateFAQSchema(faqItems)} />
      <div className="rounded-[32px] bg-white px-6 py-10 shadow-sm ring-1 ring-[#f1eadc] md:px-10 md:py-14">
        <div className="max-w-3xl">
          <h2
            id="home-faq-heading"
            className="text-3xl font-black text-[#1f2937] md:text-4xl"
          >
            Sıkça Sorulan Sorular
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-[#4b5563] md:text-base">
            Berber ve kuaför malzemeleri satın alırken en çok sorulan konuları
            aşağıda topladık. Bu bölüm, hem kullanıcıların hızlı bilgiye
            ulaşmasını hem de arama motorlarının anasayfa içeriğini daha iyi
            anlamasını destekler.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {faqItems.map((faq, index) => (
            <Accodion
              key={faq.question}
              init={index === 0}
              title={faq.question}
              des={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
