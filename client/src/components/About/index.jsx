// client/src/components/About/index.jsx
import { useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import BlogCard from "@/components/Helpers/Cards/BlogCard";
import Star from "@/components/Helpers/icons/Star";
import PageTitle from "@/components/Helpers/PageTitle";
import SimpleSlider from "@/components/Helpers/SliderCom";
import Layout from "@/components/Partials/Layout";
import DataIteration from "@/components/Helpers/DataIteration";

/* === RTK Query === */
import { useListPublicAboutQuery } from "@/api-manage/api-call-functions/public/publicAbout.api";
import { useListCommentsForContentQuery } from "@/api-manage/api-call-functions/public/publicComment.api";
import { useListPublicNewsQuery } from "@/api-manage/api-call-functions/public/publicNews.api"; // <— haberler

/* i18n context (merkezi dil) */
import { useT } from "@/i18n/I18nProvider";

/* ===================== i18n helpers ===================== */
const pickStrict = (val, lang) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  if (typeof val === "object") return typeof val?.[lang] === "string" ? val[lang] : "";
  return String(val);
};

/** İçerik HTML mi düz metin mi? (prop-types ile) */
const HtmlOrText = ({ value }) => {
  const { lang } = useT();
  const str = pickStrict(value, lang);
  if (!str) return null;
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(str);
  return looksHtml ? (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: str }} />
  ) : (
    <p className="text-[15px] text-qgraytwo leading-7">{str}</p>
  );
};
HtmlOrText.propTypes = { value: PropTypes.any };

/* ===================== feedback helpers ===================== */
const FALLBACK_AVATAR = `${import.meta.env.VITE_PUBLIC_URL || ""}/assets/images/comment-user-1.png`;

const extractImageUrl = (obj) => {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  if (obj?.url) return obj.url;
  return (
    obj?.profileImage?.url ||
    obj?.profileImage?.thumbnail ||
    obj?.avatarUrl ||
    obj?.avatar?.url ||
    obj?.image?.url ||
    obj?.photo?.url ||
    obj?.picture?.url ||
    null
  );
};

const resolvePublicUrl = (u) => {
  if (!u) return FALLBACK_AVATAR;
  const s = String(u);
  if (/^https?:\/\//i.test(s)) return s;
  const base = import.meta.env.VITE_PUBLIC_URL || "";
  if (!s.startsWith("/") && !base.endsWith("/")) return `${base}/${s}`;
  return `${base}${s}`;
};

const normalizeToFive = (v) => {
  let n = Number(v) || 0;
  if (n > 0 && n <= 1) n = n * 5;
  if (n > 5) n = 5;
  if (n > 0 && n < 1) n = 1;
  return Math.round(n);
};

const getStarsFromItem = (rv) => {
  const pool = [rv?.rating, rv?.stars, rv?.star, rv?.rate, rv?.score].map((v) => Number(v));
  const first = pool.find((v) => v && v > 0);
  return first ? normalizeToFive(first) : 0;
};

/* ===================== component ===================== */
export default function About() {
  const { lang } = useT();

  /* 1) ABOUT içerik */
  const { data: aboutList, isLoading, isError } = useListPublicAboutQuery({ onlyLocalized: true });
  const about = useMemo(() => aboutList?.items?.[0] || null, [aboutList]);

  /* 2) FEEDBACK (yorum+review) — genel: contentType=about, contentId=about._id */
  const aboutId = about?._id || about?.id;
  const {
    data: fbResp,
    isLoading: fbLoading,
  } = useListCommentsForContentQuery(
    { contentType: "about", contentId: aboutId, page: 1, limit: 12 },
    { skip: !aboutId }
  );
  const feedbackItems = useMemo(() => {
    const arr = Array.isArray(fbResp?.items) ? [...fbResp.items] : [];
    arr.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    return arr;
  }, [fbResp]);

  /* 3) NEWS — son 2 öğe */
  const { data: newsData } = useListPublicNewsQuery({ page: 1, limit: 2, onlyLocalized: true });
  const newsItems = useMemo(() => {
    const items = Array.isArray(newsData?.items) ? newsData.items : [];
    return items.map((n) => {
      const img =
        n?.image?.url ||
        n?.images?.[0]?.url ||
        (typeof n?.images?.[0] === "string" ? n.images[0] : null) ||
        `${import.meta.env.VITE_PUBLIC_URL || ""}/assets/images/blog-1.png`;
      // BlogCard’ın beklediği olası alan setini dolduralım
      return {
        id: n?._id || n?.id,
        img,
        title: pickStrict(n?.title, lang) || "",
        shortDesc: pickStrict(n?.summary, lang) || "",
        date: n?.publishedAt || n?.createdAt || "",
        slug: (typeof n?.slug === "object" ? n?.slug?.[lang] : n?.slug) || "",
        // ek alanlar kalsa da BlogCard görmezden gelir
      };
    });
  }, [newsData, lang]);

  /* Slider ayarları (stil korunur) */
  const settings = {
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    dots: false,
    responsive: [
      { breakpoint: 1026, settings: { slidesToShow: 2, slidesToScroll: 2, centerMode: false } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: false } },
    ],
  };
  const slider = useRef(null);
  const prev = () => slider.current?.slickPrev();
  const next = () => slider.current?.slickNext();

  /* Görsel ve metin */
  const bannerSrc =
    about?.images?.[0]?.url ||
    (typeof about?.images?.[0] === "string" ? about.images[0] : null) ||
    `${import.meta.env.VITE_PUBLIC_URL}/assets/images/about-banner.png`;
  const pageTitle = pickStrict(about?.title, lang) || "About Us";
  const summary = about?.summary;
  const content = about?.content;

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="about-page-wrapper w-full">
        <div className="title-area w-full">
          <PageTitle
            title={pageTitle}
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "About us", path: "/about" },
            ]}
          />
        </div>

        <div className="aboutus-wrapper w-full">
          <div className="container-x mx-auto">
            <div className="w-full min-h-[665px] lg:flex lg:space-x-12 items-center pb-10 lg:pb-0">
              <div className="md:w-[570px] w-full md:h-[560px] h-auto rounded overflow-hidden my-5 lg:my-0">
                <img src={bannerSrc} alt="about" className="w-full h" />
              </div>

              <div className="content flex-1">
                <h1 className="text-[18px] font-medium text-qblack mb-2.5">{pageTitle}</h1>

                {isLoading && (
                  <p className="text-[15px] text-qgraytwo leading-7 mb-2.5">Loading…</p>
                )}
                {isError && (
                  <p className="text-[15px] text-qgraytwo leading-7 mb-2.5">
                    We couldn’t load the content. Please try again.
                  </p>
                )}
                {!isLoading && !isError && (
                  <>
                    {summary && (
                      <p className="text-[15px] text-qgraytwo leading-7 mb-2.5">
                        {pickStrict(summary, lang)}
                      </p>
                    )}
                    <div className="mb-5">
                      <HtmlOrText value={content} />
                    </div>
                  </>
                )}

                <Link to="/contact">
                  <div className="w-[121px] h-10">
                    <span className="yellow-btn">Contact Us</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== FEEDBACK (API) ===================== */}
        <div className="customer-feedback w-full bg-white py-[60px]">
          <div className="title flex justify-center mb-5">
            <h1 className="text-[30px] font-semibold text-qblack">Customers Feedback</h1>
          </div>

          <div className="feedback-slider-wrapper w-vw relative overflow-hidden">
            <SimpleSlider selector={slider} settings={settings}>
              {(fbLoading ? Array.from({ length: 3 }) : feedbackItems).map((rv, idx) => {
                const key = rv?._id || rv?.id || idx;
                const author = rv?.name || rv?.authorName || rv?.user?.name || "Anonymous";
                const text =
                  rv?.text || rv?.comment || rv?.label || "";
                const stars = getStarsFromItem(rv);
                const avatar =
                  resolvePublicUrl(
                    extractImageUrl(rv?.user) ||
                    extractImageUrl(rv?.profileImage) ||
                    extractImageUrl(rv) ||
                    null
                  );

                return (
                  <div key={key} className="item h-[385px] bg-primarygray sm:px-10 sm:py-9 p-2">
                    <div className="flex flex-col justify-between h-full">
                      <div className="rating flex space-x-1 items-center">
                        <div className="flex items-center">
                          {/* Stil korunuyor: 5 sabit yıldız */}
                          <Star w="20" h="20" />
                          <Star w="20" h="20" />
                          <Star w="20" h="20" />
                          <Star w="20" h="20" />
                          <Star w="20" h="20" />
                        </div>
                        <span className="text-[13px] text-qblack">
                          ({Number(stars || 0).toFixed(1)})
                        </span>
                      </div>

                      <div className="text-[15px] text-qgraytwo leading-[30px] text-justify line-clamp-6">
                        {fbLoading ? "Loading..." : text || "—"}
                      </div>

                      <div className="flex items-center space-x-2.5 mt-3">
                        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                          <img
                            src={avatar}
                            alt={author}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_AVATAR;
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-[18px] text-qblack font-medium">{author}</p>
                          {/* Lokasyon alanımız yok → eski stil korunur, sabit bir metin basmıyoruz */}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </SimpleSlider>

            <div className="slider-btns flex justify-center mt-[40px]">
              <div className="flex space-x-5 item-center">
                <button
                  onClick={prev}
                  type="button"
                  className="w-[48px] h-[48px] rounded-full overflow-hidden flex justify-center items-center border border-qyellow text-qyellow focus:bg-qyellow focus:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  type="button"
                  className="w-[48px] h-[48px] rounded-full overflow-hidden flex justify-center items-center border border-qyellow text-qyellow focus:bg-qyellow focus:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== NEWS (API) ===================== */}
        <div className="blog-post-wrapper w-full mb-[30px]">
          <div className="container-x mx-auto">
            <div className="blog-post-title flex justify-center items-cente mb-[30px]">
              <h1 className="text-3xl font-semibold text-qblack">My Latest News</h1>
            </div>

            <div className="blogs-wrapper w-full">
              <div className="grid md:grid-cols-2 grid-cols-1 lg:gap-[30px] gap-5">
                <DataIteration datas={newsItems} startLength={0} endLength={2}>
                  {({ datas }) => (
                    <div data-aos="fade-up" key={datas.id} className="item w-full">
                      <BlogCard datas={datas} />
                    </div>
                  )}
                </DataIteration>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
