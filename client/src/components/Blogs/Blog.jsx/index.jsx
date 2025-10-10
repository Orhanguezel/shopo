// client/src/components/Blogs/Blog/index.jsx
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";

/* i18n */
import { useT } from "@/i18n/I18nProvider";

/* API — news */
import {
  useGetPublicNewsBySlugQuery,
  useListPublicNewsQuery,
} from "@/api-manage/api-call-functions/public/publicNews.api";

/* Yorumlar (genel yorum bileşeni — contentId ile) */
import CommentBlog from "./CommentBlog";

import PropTypes from "prop-types";

/* Yardımcılar */
const pickStrict = (val, lang) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  if (typeof val === "object") return (typeof val?.[lang] === "string" ? val[lang] : "");
  return String(val);
};

const HtmlOrText = ({ value }) => {
  const { lang } = useT();
  const str = pickStrict(value, lang);
  if (!str) return null;
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(str);
  return looksHtml ? (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: str }} />
  ) : (
    <p className="text-qgraytwo text-[15px] leading-[30px] mb-10">{str}</p>
  );
};

HtmlOrText.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,   // çok dilli / parçalı içerik için
    PropTypes.object,  // {en: "...", tr: "..."} gibi i18n objeleri için
  ]),
};

HtmlOrText.defaultProps = {
  value: "",
};

const fallbackImg = (p) =>
  p || `${import.meta.env.VITE_PUBLIC_URL || ""}/assets/images/blog-img-1.jpg`;

export default function Blog() {
  const { lang } = useT();
  const { slug = "" } = useParams();

  /* Detay */
  const { data: post, isLoading, isError } = useGetPublicNewsBySlugQuery(slug);

  /* Sidebar “Latest Post” */
  const { data: latestList } = useListPublicNewsQuery({
    page: 1, limit: 3, onlyLocalized: true
  });

  const mainImage = useMemo(() => {
    const p =
      post?.image?.url ||
      post?.images?.[0]?.url ||
      (typeof post?.images?.[0] === "string" ? post.images[0] : "");
    return fallbackImg(p);
  }, [post]);

  const sidebarLatest = useMemo(() => {
    const items = Array.isArray(latestList?.items) ? latestList.items : [];
    return items.map((n) => {
      const img =
        n?.image?.url ||
        n?.images?.[0]?.url ||
        (typeof n?.images?.[0] === "string" ? n.images[0] : "") ||
        `${import.meta.env.VITE_PUBLIC_URL || ""}/assets/images/blog-img-2.jpg`;
      return {
        id: n?._id || n?.id,
        title: pickStrict(n?.title, lang),
        date: n?.publishedAt || n?.createdAt || "",
        img,
        slug: (typeof n?.slug === "object" ? n?.slug?.[lang] : n?.slug) || "",
      };
    });
  }, [latestList, lang]);

  const title = pickStrict(post?.title, lang) || "Blog Details";
  const summary = pickStrict(post?.summary, lang);
  const content = post?.content; // HtmlOrText kendisi i18n string’i çözer
  const tags = Array.isArray(post?.tags) ? post.tags : [];
  const categories = Array.isArray(post?.categories) ? post.categories : [];

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="blog-page-wrapper w-full">
        <div className="title-area mb-[60px]">
          <PageTitle
            title={title}
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "blogs", path: "/blogs" },
              { name: "blog details", path: `/blogs/${slug}` },
            ]}
          />
        </div>

        <div className="content-area w-full">
          <div className="container-x mx-auto">
            <div className="blog-article lg:flex lg:space-x-[30px] mb-7">
              <div className="flex-1">
                {/* Görsel */}
                <div className="img w-full h-[457px]">
                  <img
                    src={mainImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* İçerik */}
                <div className="blog pl-[24px] pt-[24px]">
                  {/* üst kısa veriler */}
                  <div className="short-data flex space-x-9 items-center mb-3">
                    <div className="flex space-x-1.5 items-center">
                      <span>
                        {/* icon aynı */}
                        <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.761 14.9996C1.55973 14.9336 1.35152 14.8896 1.16065 14.7978C0.397206 14.4272 -0.02963 13.6273 0.00160193 12.743C0.0397743 11.6936 0.275749 10.7103 0.765049 9.7966C1.42439 8.56373 2.36829 7.65741 3.59327 7.07767C3.67309 7.04098 3.7529 7.00428 3.85007 6.95658C2.68061 5.9512 2.17396 4.67062 2.43422 3.10017C2.58691 2.18285 3.03804 1.42698 3.72514 0.847238C5.24163 -0.42967 7.34458 -0.216852 8.60773 1.1738C9.36424 2.00673 9.70779 3.01211 9.61757 4.16426C9.52734 5.31642 9.01375 6.23374 8.14619 6.94924C8.33359 7.04098 8.50363 7.11436 8.6702 7.20609C10.1485 8.006 11.1618 9.24254 11.6997 10.9011C11.9253 11.5945 12.0328 12.3137 11.9912 13.0476C11.9357 14.0163 11.2243 14.8235 10.3151 14.9703C10.2908 14.974 10.2665 14.9886 10.2387 14.9996C7.41051 14.9996 4.58575 14.9996 1.761 14.9996ZM6.00507 13.8475C7.30293 13.8475 8.60079 13.8401 9.89518 13.8512C10.5684 13.8548 10.9571 13.3338 10.9015 12.7577C10.8807 12.5486 10.8773 12.3394 10.846 12.1303C10.6309 10.6185 9.92294 9.41133 8.72225 8.5784C7.17106 7.50331 5.50883 7.3602 3.84313 8.23349C2.05944 9.16916 1.15718 10.7506 1.09125 12.8568C1.08778 13.0072 1.12595 13.1723 1.18494 13.3044C1.36193 13.6934 1.68466 13.8438 2.08026 13.8438C3.392 13.8475 4.70027 13.8475 6.00507 13.8475ZM5.99119 6.53462C7.38969 6.54195 8.53833 5.33843 8.54527 3.85238C8.55221 2.37733 7.41745 1.16647 6.00507 1.15179C4.62046 1.13344 3.45794 2.35531 3.45099 3.8377C3.44405 5.31275 4.58922 6.52728 5.99119 6.53462Z" fill="#FFBB38"/>
                        </svg>
                      </span>
                      <span className="text-base text-qgraytwo capitalize">
                        {post?.author?.name || "Admin"}
                      </span>
                    </div>

                    <div className="flex space-x-1.5 items-center">
                      <span>
                        {/* icon aynı */}
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.73636 12.2092C3.29706 12.1112 2.89189 11.9493 2.52936 11.698C1.55268 11.0206 1.02382 10.0834 1.01102 8.89479C0.989696 7.06292 0.993961 5.23105 1.00676 3.39919C1.02382 1.68235 2.23934 0.297797 3.94108 0.0379278C4.11168 0.0123668 4.29081 0.00384653 4.46567 0.00384653C7.15688 0.00384653 9.8481 -0.000413627 12.5393 0.00384653C14.2069 0.00810668 15.5717 1.10723 15.9172 2.73034C15.9684 2.97317 15.9897 3.22452 15.9897 3.47587C15.994 5.25236 15.9982 7.0331 15.994 8.80958C15.9897 10.5136 14.8637 11.8939 13.2047 12.2134C12.9701 12.2603 12.7312 12.2688 12.4924 12.2688C11.2939 12.2731 10.0997 12.2731 8.90127 12.2688C8.77332 12.2688 8.66669 12.2986 8.56007 12.3711C7.33175 13.1933 6.10343 14.0112 4.87511 14.8334C4.71731 14.9399 4.55097 15.0166 4.35478 14.9953C3.98799 14.957 3.74489 14.6843 3.74062 14.3009C3.73636 13.6747 3.74062 13.0442 3.74062 12.4179C3.73636 12.354 3.73636 12.2901 3.73636 12.2092Z" fill="#FFBB38"/>
                          <path d="M8.48317 5.45638C7.13543 5.45638 5.79196 5.45638 4.44422 5.45638C3.93668 5.45638 3.60401 4.99628 3.77461 4.54044C3.87697 4.26353 4.09022 4.12295 4.38024 4.09313C4.43142 4.08887 4.48687 4.08887 4.53805 4.08887C7.17808 4.08887 9.81385 4.08887 12.4539 4.08887C12.569 4.08887 12.6885 4.09739 12.7994 4.13147C13.115 4.22945 13.2984 4.5447 13.2514 4.88552C13.2088 5.19651 12.9273 5.44786 12.5946 5.45212C12.2108 5.46064 11.8269 5.45212 11.4473 5.45212C10.4621 5.45638 9.47265 5.45638 8.48317 5.45638Z" fill="#FFBB38"/>
                          <path d="M8.48349 8.17895C7.58784 8.17895 6.69646 8.18321 5.80507 8.17895C5.32739 8.17469 5.01178 7.78701 5.11841 7.3397C5.18238 7.05853 5.42975 6.84552 5.71977 6.82848C5.76242 6.82422 5.80507 6.82422 5.84772 6.82422C7.6177 6.82422 9.39194 6.82422 11.1619 6.82422C11.5586 6.82422 11.8272 7.02871 11.8955 7.37378C11.9765 7.78275 11.6822 8.16617 11.2643 8.17895C10.8889 8.19173 10.5094 8.18321 10.1298 8.18321C9.5796 8.17895 9.03368 8.17895 8.48349 8.17895Z" fill="#FFBB38"/>
                        </svg>
                      </span>
                      <span className="text-base text-qgraytwo">
                        {(post?.commentCount ?? 0)} Comments
                      </span>
                    </div>
                  </div>

                  <div className="details">
                    <h1 className="text-[22px] text-qblack font-semibold line-clamp-2 mb-1 capitalize">
                      {title}
                    </h1>
                    {/* summary */}
                    <HtmlOrText value={summary} />
                    {/* content (html/text) */}
                    <HtmlOrText value={content} />
                  </div>
                </div>

                {/* alt ekstra görseller — API’de varsa göster */}
                {Array.isArray(post?.images) && post.images.length > 1 && (
                  <div className="extra-content w-full">
                    <div className="w-full sm:flex sm:space-x-[30px] mb-3">
                      <div className="sm:w-[370px] h-[235px]">
                        <img
                          src={fallbackImg(
                            post.images[1]?.url || (typeof post.images[1] === "string" ? post.images[1] : "")
                          )}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {post.images[2] && (
                        <div className="flex-1 h-[235px]">
                          <img
                            src={fallbackImg(
                              post.images[2]?.url || (typeof post.images[2] === "string" ? post.images[2] : "")
                            )}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pl-[24px] mb-10">
                      {summary ? (
                        <>
                          <h1 className="text-[22px] font-semibold text-qblack mb-2">
                            {title}
                          </h1>
                          <HtmlOrText value={summary} />
                        </>
                      ) : null}

                      {/* basit madde listesi (varsa) */}
                      {Array.isArray(post?.highlights) && post.highlights.length > 0 && (
                        <ul className="flex flex-col space-y-3.5">
                          {post.highlights.map((h, i) => (
                            <li key={i} className="flex space-x-5 items-center">
                              <span>
                                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12.5" cy="12.5" r="12.5" fill="#FFBB38" />
                                  <path d="M10.1691 13.2566C10.5172 12.8649 10.8498 12.4803 11.198 12.1029C12.7761 10.3864 14.4973 8.80535 16.4699 7.47353C16.6749 7.33465 16.8876 7.20289 17.1042 7.0747C17.1739 7.03552 17.2628 7.00347 17.344 7.00347C17.7888 6.99635 18.2337 6.99991 18.6746 6.99991C18.8138 6.99991 18.926 7.04265 18.9763 7.16728C19.0266 7.28836 18.9879 7.39163 18.8835 7.48065C17.0772 8.99765 15.588 10.7639 14.1724 12.5872C12.8689 14.2644 11.6621 16.0022 10.5288 17.7863C10.4901 17.8504 10.4398 17.918 10.3741 17.9572C10.2348 18.0462 10.0763 17.9964 9.97183 17.8432C9.79777 17.5868 9.63532 17.3233 9.44966 17.074C8.36278 15.6318 7.26817 14.1896 6.17742 12.751C6.13488 12.6976 6.08846 12.6441 6.04978 12.5872C5.97243 12.4732 5.97629 12.3486 6.07686 12.256C6.36695 11.9853 6.66478 11.7147 6.96261 11.4476C7.07864 11.3444 7.20242 11.3515 7.35713 11.4476C7.83675 11.7539 8.31637 12.0637 8.79212 12.3699C9.24853 12.6655 9.70495 12.9575 10.1691 13.2566Z" fill="#222222" />
                                </svg>
                              </span>
                              <span className="text-[15px] text-black font-medium">
                                {pickStrict(h, lang)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="w-full h-[1px] bg-[#DCDCDC]"></div>
                  </div>
                )}

                {/* === Yorum & Paylaşım alanı (HER ZAMAN görünsün) === */}
                <div className="comment-area w-full mt-4">
                  <div className="w-full sm:flex justify-between items-center mb-[30px]">
                    <div className="tags flex space-x-5 items-center mb-5 sm:mb-0">
                      <span className="text-2xl text-qblack">Tags:</span>
                      {tags.length > 0 ? (
                        tags.map((t, i) => (
                          <span key={i} className="text-base text-qgraytwo hover:text-qyellow">
                            #{pickStrict(t, lang) || t}
                          </span>
                        ))
                      ) : (
                        <span className="text-base text-qgraytwo">—</span>
                      )}
                    </div>

                    {/* share ikonları aynı bırakıldı */}
                    <div className="tags flex space-x-5 items-center">
                      <span className="text-2xl text-qblack">Share:</span>
                      <div className="flex space-x-2.5 items-center">
                        <span className="text-base ">{/* facebook */}</span>
                        <span className="text-base ">{/* twitter */}</span>
                        <span className="text-base ">{/* linkedin */}</span>
                        <span className="text-base ">{/* youtube */}</span>
                      </div>
                    </div>
                  </div>

                  {/* Yorumlar */}
                  {post?._id || post?.id ? (
                    <CommentBlog contentId={post._id || post.id} />
                  ) : isLoading ? (
                    <div className="text-qgray">Loading comments…</div>
                  ) : isError ? (
                    <div className="text-qgray">Comments unavailable.</div>
                  ) : null}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-[370px] w-full">
                {/* Search (pasif) */}
                <div data-aos="fade-up" className="search-widget w-full p-[30px] bg-white mb-[30px]">
                  <h1 className="text-[22px] text-qblack font-bold mb-5">Search</h1>
                  <div className="w-full h-[1px] bg-[#DCDCDC] mb-5"></div>
                  <div className="w-full h-[60px] relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full h-full bg-[#F9F3E9] focus:outline-none focus:ring-0 pl-5 pr-16 placeholder:text-qgraytwo"
                    />
                    <span className="absolute right-5 top-[17px]">{/* icon */}</span>
                  </div>
                </div>

                {/* Latest Post — API’den */}
                <div data-aos="fade-up" className="latest-post-widget w-full bg-white p-[30px] mb-[30px]">
                  <h1 className="text-[22px] text-qblack font-bold mb-5">Latest Post</h1>
                  <div className="w-full h-[1px] bg-[#DCDCDC] mb-5"></div>
                  <ul className="flex flex-col space-y-5">
                    {sidebarLatest.map((it) => (
                      <li key={it.id} className="flex space-x-5 items-center h-[95px]">
                        <Link to={`/blogs/${it.slug}`} className="w-[85px] h-full overflow-hidden rounded block">
                          <img src={it.img} alt={it.title} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 h-full flex flex-col justify-between">
                          <Link to={`/blogs/${it.slug}`} className="text-[18px] text-qblack leading-7 line-clamp-2 hover:text-qyellow">
                            {it.title}
                          </Link>
                          <div className="flex space-x-3 items-center">
                            <span>{/* calendar icon */}</span>
                            <span className="text-sm text-qgraytwo">
                              {it.date ? new Date(it.date).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                    {sidebarLatest.length === 0 && (
                      <li className="text-qgray">No posts.</li>
                    )}
                  </ul>
                </div>

                {/* Categories — mevcut post */}
                <div data-aos="fade-up" className="categories-widget w-full bg-white p-[30px] mb-[30px]">
                  <h1 className="text-[22px] text-qblack font-bold mb-5">Categories</h1>
                  <div className="w-full h-[1px] bg-[#DCDCDC] mb-5"></div>
                  <ul className="flex flex-col space-y-5">
                    {categories.length > 0 ? (
                      categories.map((c, i) => (
                        <li key={i} className="flex justify-between items-center group">
                          <span className="text-base text-qgraytwo group-hover:text-qyellow">
                            {pickStrict(c?.name ?? c, lang)}
                          </span>
                          <span className="text-base text-qgraytwo group-hover:text-qyellow">
                            {(c?.count ?? "") && `(${c.count})`}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-qgray">—</li>
                    )}
                  </ul>
                </div>

                {/* Popular Tags — mevcut post */}
                <div data-aos="fade-up" className="popular-tag-widget w-full bg-white p-[30px] mb-[30px]">
                  <h1 className="text-[22px] text-qblack font-bold mb-5">Popular Tags</h1>
                  <div className="w-full h-[1px] bg-[#DCDCDC] mb-5"></div>
                  <div className="filter-items">
                    <div className="flex gap-[10px] flex-wrap">
                      {tags.length > 0 ? (
                        tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-base bg-[#F9F3E9] hover:bg-qyellow text-[#9A9A9A] hover:text-qblack px-[14px] py-[6px] cursor-pointer mb-[5px]"
                          >
                            {pickStrict(t, lang) || String(t)}
                          </span>
                        ))
                      ) : (
                        <span className="text-qgray">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Newsletter (opsiyonel) */}
                <div
                  data-aos="fade-up"
                  className="w-full h-[358px]"
                  style={{
                    background: `url(${import.meta.env.VITE_PUBLIC_URL || ""}/assets/images/new-letter.jpg) no-repeat`,
                    backgroundSize: "cover",
                  }}
                >
                  <div className="w-full h-full p-[30px] bg-black bg-opacity-75 flex flex-col justify-between">
                    <div>
                      <h1 className="text-[22px] text-white font-bold mb-5">Our Newsletter</h1>
                      <div className="w-full h-[1px] bg-[#615B9C] mb-5"></div>
                      <p className="text-base text-white leading-[26px] line-clamp-2">
                        Follow our newsletter to stay updated about us.
                      </p>
                    </div>
                    <div>
                      <div className="w-full mb-3.5">
                        <input
                          type="text"
                          className="w-full h-[60px] bg-[#ECEAEC] pl-5 focus:outline-none focus:ring-0 placeholder:text-[#9A9A9A]"
                          placeholder="Enter Your Email Address"
                        />
                      </div>
                      <button type="button" className="w-full h-[60px]">
                        <span className="yellow-btn w-full h-full" style={{ fontSize: "18px" }}>
                          Subscribe
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* /sidebar */}
            </div>

            {isLoading && <div className="text-qgray mb-6">Loading…</div>}
            {isError && <div className="text-qgray mb-6">Couldn’t load the blog post.</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
