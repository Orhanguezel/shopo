// client/src/components/Blogs/Blog/CommentBlog.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import InputCom from "@/components/Helpers/InputCom";
import LoaderStyleOne from "@/components/Helpers/Loaders/LoaderStyleOne";
import StarRating from "@/components/Helpers/StarRating";

/* API – auth & comment (genel) */
import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";
import {
  useListCommentsForContentQuery,
  useCreateCommentPublicMutation,
} from "@/api-manage/api-call-functions/public/publicComment.api";

/* ================== Avatar helpers ================== */
const FALLBACK_AVATAR_RAW = "/assets/images/comment-user-1.png";
const FALLBACK_AVATAR = `${import.meta.env.VITE_PUBLIC_URL || ""}${FALLBACK_AVATAR_RAW}`;

const resolvePublicUrl = (u) => {
  if (!u) return FALLBACK_AVATAR;
  const s = String(u);
  if (/^https?:\/\//i.test(s)) return s;
  const base = import.meta.env.VITE_PUBLIC_URL || "";
  if (!s.startsWith("/") && !base.endsWith("/")) return `${base}/${s}`;
  return `${base}${s}`;
};

const extractImageFromObj = (obj) => {
  if (!obj) return null;
  if (typeof obj === "string") return obj;

  if (obj?.profileImage?.url) return obj.profileImage.url;
  if (obj?.profileImage?.thumbnail) return obj.profileImage.thumbnail;
  if (typeof obj.avatarUrl === "string") return obj.avatarUrl;

  const direct =
    obj.avatar ??
    obj.image ??
    obj.photo ??
    obj.picture ??
    obj.profileImage ??
    obj.profilePhoto ??
    obj.profilePic ??
    null;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct.url === "string") return direct.url;
  if (direct && typeof direct.src === "string") return direct.src;
  if (direct && typeof direct.path === "string") return direct.path;
  if (direct && typeof direct.thumbnail === "string") return direct.thumbnail;

  const nested =
    obj?.avatar?.url ??
    obj?.image?.url ??
    obj?.photo?.url ??
    obj?.picture?.url ??
    obj?.profile?.avatar?.url ??
    obj?.profile?.image?.url ??
    obj?.profile?.image?.thumbnail ??
    null;
  if (typeof nested === "string") return nested;
  return null;
};

/* ================== Rating helpers ================== */
// 0..1 arası gelirse 1..5’e ölçekle; 1..5’i yuvarla
const normalizeToFive = (v) => {
  let n = Number(v) || 0;
  if (n > 0 && n <= 1) n = n * 5;
  if (n > 5) n = 5;
  if (n > 0 && n < 1) n = 1;
  return Math.round(n);
};

// response içinden olası rating alanlarını yakala
const getStarsFromItem = (rv) => {
  const pool = [rv?.rating, rv?.stars, rv?.star, rv?.rate, rv?.score].map((v) => Number(v));
  if (typeof rv?.label === "string") {
    const m = rv.label.match(/rating\s*:\s*(\d+(\.\d+)?)/i);
    if (m) pool.push(Number(m[1]));
  }
  const first = pool.find((v) => v && v > 0);
  return first ? normalizeToFive(first) : 0;
};

export default function CommentBlog({ contentId }) {
  const { data: me } = useMeQuery();

  const validId =
    typeof contentId === "string" && contentId.length >= 8 ? contentId : undefined;

  /* ---------- Form ---------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewLoading, setLoading] = useState(false);

  useEffect(() => {
    if (me) {
      if (me.name && !name) setName(me.name);
      if (me.email && !email) setEmail(me.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  /* ---------- Liste + sayfalama ---------- */
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const limit = 6;

  const {
    data: listResp,
    isFetching,
    isLoading,
    refetch,
  } = useListCommentsForContentQuery(
    { contentType: "news", contentId: validId, page, limit }, // type göndermiyoruz → comment+review gelir
    { skip: !validId }
  );

  useEffect(() => {
    if (!listResp) return;
    const arr = Array.isArray(listResp?.items) ? [...listResp.items] : [];
    arr.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    setItems((prev) => (page === 1 ? arr : [...prev, ...arr]));

    const total = Number(
      listResp?.total ?? listResp?.pagination?.total ?? listResp?.meta?.total ?? 0
    );
    const pageSize = Number(listResp?.meta?.limit ?? limit);
    setHasMore(total ? page * pageSize < total : arr.length >= limit);
  }, [listResp, page]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [validId]);

  const loadMore = () => {
    if (!hasMore || isFetching) return;
    setPage((p) => p + 1);
  };

  /* ---------- Create (comment & review) ---------- */
  const [createComment] = useCreateCommentPublicMutation();

  const reviewAction = async () => {
    if (!validId) {
      toast.error("Blog ID geçersiz.");
      return;
    }
    const trimmed = (message || "").trim();
    const normalized = normalizeToFive(rating);
    const hasText = Boolean(trimmed);
    const hasRating = normalized > 0;

    if (!hasText && !hasRating) {
      toast.error("Lütfen yorum yazın veya yıldız verin.");
      return;
    }

    try {
      setLoading(true);

      const meAvatarRaw =
        extractImageFromObj(me) ||
        extractImageFromObj(me?.profile) ||
        extractImageFromObj(me?.profileImage) ||
        null;

      const payloadBase = {
        contentType: "news",
        contentId: validId,
        name: name || me?.name || undefined,
        email: email || me?.email || undefined,
        ...(meAvatarRaw ? { profileImage: { url: resolvePublicUrl(meAvatarRaw) } } : {}),
      };

      const payload = hasRating
        ? {
            ...payloadBase,
            type: "review",
            rating: normalized,
            text: trimmed || `rating:${normalized}`,
            label: `rating:${normalized}`,
          }
        : {
            ...payloadBase,
            type: "comment",
            text: trimmed,
          };

      await createComment(payload).unwrap();

      toast.success(
        hasRating
          ? hasText
            ? "Puanınız ve yorumunuz gönderildi."
            : "Puanınız gönderildi."
          : "Yorumunuz gönderildi."
      );

      setMessage("");
      setRating(0);
      setHoverRating(0);
      setPage(1);
      await refetch();
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.error ||
        (typeof e?.message === "string" ? e.message : "Gönderilemedi");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */
  const pending = isLoading && page === 1;
  const totalComments = items.length;

  return (
    <>
      {/* Yorum Yaz formu (anchor ile) */}
      <div id="write-comment" className="write-review w-full mb-[30px]">
        <h1 className="text-2xl font-medium text-qblack mb-5">Yorum Yaz</h1>

        {/* yıldız seçimi */}
        <div className="flex space-x-1 items-center mb-[22px]">
          <StarRating
            hoverRating={hoverRating}
            hoverHandler={(v) => setHoverRating(v)}
            rating={normalizeToFive(rating)}
            ratingHandler={(v) => setRating(v)}
          />
          <span className="text-qblack text-[15px] font-normal mt-1">
            ({normalizeToFive(rating) || 0}.0)
          </span>
        </div>

        <div className="w-full review-form">
          <div className="sm:flex sm:space-x-[30px] items-center mb-5 w-full">
            <div className="w-full mb-5 sm:mb-0">
              <InputCom
                label="Ad Soyad"
                placeholder=""
                type="text"
                name="name"
                inputClasses="h-[50px]"
                value={name}
                inputHandler={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-full">
              <InputCom
                label="E-posta"
                placeholder=""
                type="email"
                name="email"
                inputClasses="h-[50px]"
                value={email}
                inputHandler={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full mb-[30px]">
            <h6 className="input-label text-qgray capitalize text-[13px] font-normal block mb-2">
              Mesaj
            </h6>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              cols="30"
              rows="3"
              className="w-full focus:ring-0 focus:outline-none p-6"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={reviewAction}
              type="button"
              className="black-btn w-[300px] h-[50px] flex justify-center"
              disabled={reviewLoading || !validId || (!message.trim() && normalizeToFive(rating) === 0)}
            >
              <span className="flex space-x-1 items-center h-full">
                <span className="text-sm font-semibold">
                  {reviewLoading ? "Gönderiliyor…" : "Gönder"}
                </span>
                {reviewLoading && (
                  <span className="w-5 " style={{ transform: "scale(0.3)" }}>
                    <LoaderStyleOne />
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Yorum Listesi */}
      <div className="w-full comments">
        <h1 className="text-2xl font-medium text-qblack mb-5">
          Yorumlar{typeof totalComments === "number" ? ` (${totalComments})` : ""}
        </h1>

        {pending && (
          <div className="bg-white px-10 py-[20px] mb-2.5 border border-qgray-border rounded text-qgray">
            Loading comments…
          </div>
        )}

        {!pending && items.length === 0 && (
          <div className="bg-white px-10 py-[20px] mb-2.5 border border-qgray-border rounded text-qgray">
            No comments yet.
          </div>
        )}

        {items.map((comment) => {
          const id = comment?.id || comment?._id;
          const author = comment?.name || comment?.authorName || comment?.user?.name || "Anonymous";
          const text = comment?.text || comment?.comment || comment?.label || "";
          const avatar = resolvePublicUrl(
            extractImageFromObj(comment?.profileImage) ||
              extractImageFromObj(comment?.user) ||
              extractImageFromObj(comment) ||
              FALLBACK_AVATAR_RAW
          );
          const stars = getStarsFromItem(comment);
          const createdAt = comment?.createdAt ? new Date(comment.createdAt) : null;

          return (
            <div key={id} className="comment-item bg-white px-10 py-[32px] mb-2.5">
              <div className="comment-author flex justify-between items-center mb-3">
                <div className="flex space-x-3 items-center">
                  <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                    <img
                      src={avatar}
                      alt={author}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                    />
                  </div>
                  <div>
                    <p className="text-[18px] font-medium text-qblack">{author}</p>
                    {createdAt && (
                      <p className="text-[13px] font-normal text-qgray">
                        {createdAt.toLocaleDateString()}{" "}
                        {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>

                {/* yıldız gösterimi (0 ise boş görünür) */}
                <div className="flex items-center">
                  <StarRating rating={stars} readOnly />
                  <span className="ml-2 text-[13px] text-qblack">
                    ({Number(stars || 0).toFixed(1)})
                  </span>
                </div>
              </div>

              {text ? (
                <div className="comment mb-[30px]">
                  <p className="text-[15px] text-qgray leading-7 text-normal">{text}</p>
                </div>
              ) : null}

              {/* cevaplar varsa */}
              {Array.isArray(comment?.replies) &&
                comment.replies.map((reply) => {
                  const rid = reply?.id || reply?._id;
                  const rauthor =
                    reply?.name || reply?.authorName || reply?.user?.name || "Anonymous";
                  const rtext = reply?.text || reply?.comment || "";
                  const rstars = getStarsFromItem(reply);
                  const rcreatedAt = reply?.createdAt ? new Date(reply.createdAt) : null;

                  return (
                    <div key={rid} className="sub-comment-item bg-white px-10 pt-[32px] border-t">
                      <div className="comment-author mb-3">
                        <div className="flex space-x-3 items-center">
                          <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                            <img
                              src={avatar}
                              alt={rauthor}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                            />
                          </div>
                          <div>
                            <p className="text-[18px] font-medium text-qblack">{rauthor}</p>
                            {rcreatedAt && (
                              <p className="text-[13px] font-normal text-qgray">
                                {rcreatedAt.toLocaleDateString()}{" "}
                                {rcreatedAt.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* reply yıldızları */}
                      <div className="flex items-center mb-2">
                        <StarRating rating={rstars} readOnly />
                        <span className="ml-2 text-[13px] text-qblack">
                          ({Number(rstars || 0).toFixed(1)})
                        </span>
                      </div>

                      {rtext ? (
                        <div className="comment mb-[30px]">
                          <p className="text-[15px] text-qgray leading-7 text-normal">{rtext}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          );
        })}

        {items.length > 0 && (
          <div className="w-full flex justify-center mt-4">
            <button
              type="button"
              onClick={loadMore}
              disabled={isFetching || !hasMore}
              className="black-btn w-[260px] h-[46px] text-sm font-semibold disabled:opacity-60"
            >
              {isFetching ? "Loading…" : hasMore ? "Load More" : "No More"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

CommentBlog.propTypes = {
  contentId: PropTypes.string.isRequired,
};
