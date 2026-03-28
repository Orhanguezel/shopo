import { TruckIcon, ShieldCheckIcon, StarIcon, CurrencyDollarIcon } from "./icons/WhySeyfibabaIcons";

const features = [
  {
    icon: TruckIcon,
    title: "Hızlı ve Güvenli Kargo",
    description:
      "Siparişleriniz aynı gün kargoya verilir. Türkiye'nin her yerine güvenli teslimat sağlıyoruz.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Profesyonel Kalite Garantisi",
    description:
      "Tüm ürünlerimiz orijinal ve garantilidir. Berber ve kuaför salonlarının ihtiyaç duyduğu profesyonel kaliteyi sunuyoruz.",
  },
  {
    icon: CurrencyDollarIcon,
    title: "En Uygun Fiyat",
    description:
      "Toptan ve perakende en uygun fiyat garantisi veriyoruz. Aradığınız berber malzemelerini, kuaför ekipmanlarını ve salon mobilyalarını rakipsiz fiyatlarla bulabilirsiniz.",
  },
  {
    icon: StarIcon,
    title: "Geniş Ürün Yelpazesi",
    description:
      "Berber koltuğundan kuaför tezgahına, saç bakım ürünlerinden salon ekipmanlarına kadar 1.000'den fazla ürün çeşidi ile hizmetinizdeyiz.",
  },
];

export default function WhySeyfibaba({ className }) {
  return (
    <section className={`w-full ${className || ""}`}>
      <div className="container-x mx-auto">
        <div className="text-center mb-10">
          <h2 className="sm:text-3xl text-2xl font-bold text-qblacktext leading-tight">
            Neden Seyfibaba?
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-base leading-relaxed">
            Türkiye'nin en kapsamlı berber ve kuaför malzemeleri pazaryeri olarak
            profesyonellere özel hizmet sunuyoruz.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-qyellow/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-qyellow" />
              </div>
              <h3 className="text-lg font-bold text-qblacktext mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
