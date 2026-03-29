"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import FontAwesomeCom from "../Helpers/icons/FontAwesomeCom";
import PageTitle from "../Helpers/PageTitle";
import ServeLangItem from "../Helpers/ServeLangItem";
import settings from "../../utils/settings";
import appConfig from "@/appConfig";
import AboutUsSlider from "../Slider/AboutUsSlider";

const IMAGE_FALLBACK = "/assets/images/server-error.png";

const trustStats = [
  { label: "Kategori odakli tedarik", value: "Berber ve kuafor ekipmanlari" },
  { label: "Hizmet modeli", value: "Cok saticili pazaryeri" },
  { label: "Odak bolge", value: "Turkiye geneli profesyonel salonlar" },
];

const missionPoints = [
  "Salon kurulumundan gunluk sarf tedarikine kadar ihtiyaclari tek bir akista toplamak",
  "Satici cesitliligini artirirken urun bilgilerini daha karsilastirilabilir hale getirmek",
  "Sektor profesyonelleri icin rehber iceriklerle satin alma kararini kolaylastirmak",
];

const editorialSections = [
  {
    title: "Seyfibaba nasil bir pazar yeri modeli izler?",
    description:
      "Platform, berber ve kuafor ekipmanlarina odaklanan cok saticili bir pazaryeri mantigiyla calisir. Kullanici, farkli saticilarin urunlerini tek bir akista inceleyebilir; boylece fiyat, stok, teknik ozellik ve magaza guven sinyallerini ayni ekranda degerlendirebilir.",
  },
  {
    title: "Hangi ihtiyaclari kapsar?",
    description:
      "Sifirdan salon kurmak isteyen girisimciler, aktif isletmesini yenileyen profesyoneller ve gunluk sarf tedarigini duzenli hale getirmek isteyen ekipler icin ekipman, mobilya ve tamamlayici urun gruplarini bir araya getirir. Bu kapsam, tek bir kategoriye degil salon operasyonunun tamamina odaklanir.",
  },
  {
    title: "Icerik ve urun dili neden guclendiriliyor?",
    description:
      "Salon profesyonelleri icin satin alma karari yalnizca urunun fiyatina gore verilmez. Dayaniklilik, servis erisimi, kullanim yogunlugu ve mekan uyumu gibi kriterler de gereklidir. Bu nedenle Seyfibaba tarafinda urun aciklamalari, kategori rehberleri ve blog icerikleri daha acik, daha baglamsal ve daha karsilastirilabilir hale getirilmektedir.",
  },
];

const workflowSteps = [
  {
    title: "Ihtiyaci tanimla",
    description:
      "Salon kurulumu, ekipman yenileme veya tekrarli sarf alimi gibi ihtiyaci netlestirmek ilk adimdir. Bu ayrim, dogru kategoriye daha hizli ulasmayi saglar.",
  },
  {
    title: "Kategori ve marka karsilastir",
    description:
      "Benzer urunleri ayni akista inceleyerek fiyat, kullanim senaryosu, stok yapisi ve teknik detaylar arasindaki farklari daha gorunur hale getirebilirsiniz.",
  },
  {
    title: "Detay ve satici sinyallerini oku",
    description:
      "Urun aciklamasi, gorseller, satici profili ve gorunur yorum verileri birlikte degerlendirildiginde satin alma karari daha savunmali hale gelir.",
  },
];

export default function About({ aboutData }) {
  const aboutBanner =
    aboutData?.aboutUs?.banner_image
      ? `${appConfig.BASE_URL + aboutData.aboutUs.banner_image}`
      : IMAGE_FALLBACK;

  const settingTestimonial = {
    autoplay: {
      delay: 2500,
    },
    navigation: true,
    slidesPerView: 1,
    loop: true,
    gap: "30px",

    pagination: false,
    breakpoints: {
      768: {
        slidesPerView: 2,
        centeredSlides: false,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3.2,
        spaceBetween: 30,
        centeredSlides: true,
      },
    },
  };

  const { text_direction } = settings();
  useEffect(() => {
    const getSliderInitElement = document.querySelectorAll(
      ".feedback-slider-wrapper div > .item"
    );
    getSliderInitElement.forEach((item) =>
      item.setAttribute("dir", `${text_direction}`)
    );
  }, [text_direction]);
  return (
    <div className="about-page-wrapper w-full">
      <div className="title-area w-full">
        <PageTitle
          title={ServeLangItem()?.About_us}
          breadcrumb={[
            { name: ServeLangItem()?.home, path: "/" },
            { name: ServeLangItem()?.About_us, path: "/about" },
          ]}
        />
      </div>

      <div className="aboutus-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="w-full min-h-[665px] lg:flex lg:space-x-12 rtl:space-x-reverse items-center pb-10 lg:pb-0">
            <div className="md:w-[570px] w-full md:h-[560px] h-auto rounded overflow-hidden my-5 lg:my-0 relative">
              <Image
                layout="fill"
                src={aboutBanner}
                alt="about"
                className="w-full h-full"
              />
            </div>
            <div className="content flex-1">
              <div id="about-editorial-content" className="about-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: aboutData.aboutUs.description,
                  }}
                ></div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {trustStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#ece7da] bg-[#fffaf0] px-5 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f7b2f]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-qblack">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-[#f8fafc] p-6">
                <h2 id="about-mission-heading" className="text-xl font-semibold text-qblack">
                  Seyfibaba neyi cozer?
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-qgraytwo">
                  {missionPoints.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 inline-block h-2 w-2 rounded-full bg-qyellow" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 grid gap-4">
                {editorialSections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-3xl border border-[#ece7da] bg-white px-6 py-5"
                  >
                    <h2 className="text-lg font-semibold text-qblack">
                      {section.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-qgraytwo">
                      {section.description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-[#ece7da] bg-[#fffaf0] px-6 py-6">
                <h2 className="text-lg font-semibold text-qblack">
                  Platform uzerinde karar sureci nasil ilerler?
                </h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {workflowSteps.map((step) => (
                    <article
                      key={step.title}
                      className="rounded-3xl bg-white px-5 py-5 ring-1 ring-[#eee0be]"
                    >
                      <h3 className="text-base font-semibold text-qblack">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-qgraytwo">
                        {step.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <Link href="/contact">
                <div className="w-fit  h-10 mt-5 cursor-pointer">
                  <span className="yellow-btn px-5">
                    {ServeLangItem()?.Contact_Us}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="customer-feedback w-full bg-white py-[60px]">
        <div className="title flex justify-center mb-5">
          <h1 className="text-[30px] font-semibold text-qblack">
            {ServeLangItem()?.Customers_Feedback}
          </h1>
        </div>
        <div className="feedback-slider-wrapper w-vw relative overflow-hidden">
          <AboutUsSlider aboutData={aboutData} settings={settingTestimonial} />
        </div>
      </div>
      <div className="container-x mx-auto my-[60px]">
        <div
          data-aos="fade-down"
          className="best-services w-full bg-qyellow flex flex-col space-y-10 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center lg:h-[110px] px-10 lg:py-0 py-10"
        >
          {aboutData &&
            aboutData.services.map((item) => (
              <div key={item.id} className="item">
                <div className="flex space-x-5 rtl:space-x-reverse items-center">
                  <div>
                    <div>
                      <FontAwesomeCom
                        className="w-8 h-8 text-qblack"
                        icon={item.icon}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-qblack text-[15px] font-700 tracking-wide mb-1 uppercase">
                      {item.title}
                    </p>
                    <p className="text-sm text-qblack line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}
