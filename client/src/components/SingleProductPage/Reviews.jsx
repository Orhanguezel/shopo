// src/components/SingleProductPage/Reviews.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import InputCom from "@/components/Helpers/InputCom";
import LoaderStyleOne from "@/components/Helpers/Loaders/LoaderStyleOne";
import StarRating from "@/components/Helpers/StarRating";

import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";
import {
  useListCommentsForContentQuery,
  useCreateCommentPublicMutation,
} from "@/api-manage/api-call-functions/public/publicComment.api";
import { getSessionId } from "@/utils/product.helpers";

/* ================= Helpers: avatar & rating ================= */
const FALLBACK_AVATAR_RAW = "/assets/images/comment-user-1.png";
const FALLBACK_AVATAR = `${import.meta.env.VITE_PUBLIC_URL || ""}${FALLBACK_AVATAR_RAW}`;

// public url ile relatif path'i birleştir
const resolvePublicUrl = (u) => {
  if (!u) return FALLBACK_AVATAR;
  const s = String(u);
  if (/^https?:\/\//i.test(s)) return s;
  const base = import.meta.env.VITE_PUBLIC_URL || "";
  if (!s.startsWith("/") && !base.endsWith("/")) return `${base}/${s}`;
  return `${base}${s}`;
};

// objeden (yorum ya da user) muhtemel görsel alanlarını çöz
const extractImageFromObj = (obj) => {
  if (!obj) return null;

  if (typeof obj === "string") return obj;

  // explicit alanlar
  if (obj?.profileImage?.url) return obj.profileImage.url;
  if (obj?.profileImage?.thumbnail) return obj.profileImage.thumbnail;
  if (typeof obj.avatarUrl === "string") return obj.avatarUrl;

  // yaygın alias'lar (string ya da {url})
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

  // nested olabilecek yapılar
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

// localStorage override oku (ProfileTab: profile_overrides:<userId>)
const getLocalOverrideAvatar = (user) => {
  if (!user) return null;
  const id = user._id || user.id;
  if (!id) return null;
  try {
    const raw = localStorage.getItem(`profile_overrides:${id}`);
    if (!raw) return null;
    const json = JSON.parse(raw);
    return typeof json?.avatarUrl === "string" ? json.avatarUrl : null;
  } catch {
    return null;
  }
};

// 0..1 gelirse 1..5’e çevir, 1..5’i yuvarla
const normalizeToFive = (v) => {
  let n = Number(v) || 0;
  if (n > 0 && n <= 1) n = n * 5;
  if (n > 5) n = 5;
  if (n > 0 && n < 1) n = 1;
  return Math.round(n);
};

const getStarsFromItem = (rv) => {
  const pool = [rv?.rating, rv?.stars, rv?.star, rv?.rate, rv?.score].map((v) => Number(v));
  if (typeof rv?.label === "string") {
    const m = rv.label.match(/rating\s*:\s*(\d+(\.\d+)?)/i);
    if (m) pool.push(Number(m[1]));
  }
  const first = pool.find((v) => v && v > 0);
  return first ? normalizeToFive(first) : 0;
};

// avatar seçimi: user -> root -> localOverride -> me -> fallback
const pickAvatar = (rv, me) => {
  const fromUser =
    extractImageFromObj(rv?.user) ||
    extractImageFromObj(rv?.user?.profileImage) ||
    null;

  // yorum kaydına gömülü profil görseli (create esnasında göndereceğiz)
  const fromRoot = extractImageFromObj(rv);

  const fromLS = getLocalOverrideAvatar(rv?.user);

  // yorum sahibi giriş yapmış kullanıcıyla aynıysa me.profileImage.url kullan
  const sameUser =
    rv?.user &&
    (rv.user._id === me?._id ||
      rv.user.id === me?._id ||
      rv.user._id === me?.id);

  const fromMe =
    sameUser
      ? extractImageFromObj(me) || extractImageFromObj(me?.profile)
      : null;

  const raw = fromUser || fromRoot || fromLS || fromMe || FALLBACK_AVATAR_RAW;
  return resolvePublicUrl(raw);
};

export default function Reviews({ productId, className = "" }) {
  const { data: me } = useMeQuery();

  const validPid =
    typeof productId === "string" && productId.length >= 8 ? productId : undefined;

  /* ---------- Form state ---------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (me) {
      if (me.name && !name) setName(me.name);
      if (me.email && !email) setEmail(me.email);
      if (me.phone && !phone) setPhone(me.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  /* ---------- List & pagination ---------- */
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const limit = 6;

  const {
    data: listResp,
    isFetching: listFetching,
    isLoading: listLoading,
    refetch: refetchList,
  } = useListCommentsForContentQuery(
    { contentType: "product", contentId: validPid, page, limit }, // type göndermiyoruz → comment+review gelir
    { skip: !validPid }
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
  }, [validPid]);

  const loadMore = () => {
    if (!hasMore || listFetching) return;
    setPage((p) => p + 1);
  };

  /* ---------- Create (comment & review — tek istek) ---------- */
  const [createComment, { isLoading: sending }] = useCreateCommentPublicMutation();

  const submitComment = async () => {
    if (!validPid) return toast.error("Ürün ID geçersiz.");

    const trimmed = (message || "").trim();
    const hasText = Boolean(trimmed);
    const normalized = normalizeToFive(rating);
    const hasRating = normalized > 0;

    if (!hasText && !hasRating) {
      return toast.error("Lütfen yorum yazın veya yıldız verin.");
    }

    try {
      const session = getSessionId();

      // me’den profil görseli çıkar ve payload’a ekle
      const meAvatarRaw =
        extractImageFromObj(me) ||
        extractImageFromObj(me?.profile) ||
        extractImageFromObj(me?.profileImage) ||
        null;

      const profileImage = meAvatarRaw ? { url: resolvePublicUrl(meAvatarRaw) } : undefined;

      const base = {
        contentType: "product",
        contentId: validPid,
        name: name || me?.name || undefined,
        email: email || me?.email || undefined,
        phone: phone || undefined, // backend bunu yoksayabilir
        session,
        ...(profileImage ? { profileImage } : {}),
      };

      // Yıldız varsa TEK 'review' kaydı + metin (varsa)
      // Yıldız yoksa 'comment' kaydı
      const payload = hasRating
        ? {
          ...base,
          type: "review",
          rating: normalized,
          text: trimmed || `rating:${normalized}`,
          label: `rating:${normalized}`,
        }
        : {
          ...base,
          type: "comment",
          text: trimmed,
        };

      await createComment(payload).unwrap();

      toast.success(
        hasRating
          ? (hasText ? "Puanınız ve yorumunuz gönderildi." : "Puanınız gönderildi.")
          : "Yorumunuz gönderildi."
      );

      setMessage("");
      setRating(0);
      setHoverRating(0);

      setPage(1);
      await refetchList();
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.error ||
        (typeof e?.message === "string" ? e.message : "Gönderilemedi");
      toast.error(msg);
    }
  };

  const pending = listLoading && page === 1;
  const moreBtnDisabled = listFetching || !hasMore;

  /* ---------- Render list ---------- */
  let listBody = null;
  if (pending) {
    listBody = (
      <div className="bg-white p-6 border border-qgray-border rounded flex items-center gap-3">
        <span className="w-6" style={{ transform: "scale(0.5)" }}>
          <LoaderStyleOne />
        </span>
        <span className="text-qgray">Loading comments…</span>
      </div>
    );
  } else if (items.length > 0) {
    listBody = items.map((rv) => {
      const id = rv?.id || rv?._id || Math.random().toString(36).slice(2);
      const author = rv?.name || rv?.authorName || rv?.user?.name || "Anonymous";
      const text = rv?.text || rv?.comment || rv?.label || "";
      const createdAt = rv?.createdAt ? new Date(rv.createdAt) : null;
      const stars = getStarsFromItem(rv);
      const avatarSrc = pickAvatar(rv, me);

      return (
        <div
          key={id}
          className="comment-item bg-white px-6 py-5 mb-2.5 border border-qgray-border rounded"
        >
          <div className="comment-author flex justify-between items-center mb-3">
            <div className="flex space-x-3 items-center">
              <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-[#f6f6f6] flex items-center justify-center">
                <img
                  src={avatarSrc}
                  alt={author}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </div>
              <div>
                <p className="text-[16px] font-medium text-qblack">{author}</p>
                {createdAt ? (
                  <p className="text-[12px] text-qgray">
                    {createdAt.toLocaleDateString()}{" "}
                    {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                ) : null}
              </div>
            </div>

            {/* YILDIZLAR: her zaman render et (0 ise boş yıldızlar görünür) */}
            <div className="flex items-center">
              <StarRating rating={stars} readOnly />
              <span className="ml-2 text-[13px] text-qblack">
                ({Number(stars || 0).toFixed(1)})
              </span>
            </div>
          </div>

          {text ? <p className="text-[15px] text-qgray leading-7">{text}</p> : null}
        </div>
      );
    });
  }

  /* ---------- UI ---------- */
  const disabled =
    sending || !validPid || (!message.trim() && normalizeToFive(rating) === 0);

  return (
    <div className={`review-wrapper w-full ${className || ""}`}>
      <div className="w-full reviews mb-[60px]">{listBody}</div>

      {items.length > 0 && (
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={moreBtnDisabled}
            className="black-btn w-[260px] h-[46px] text-sm font-semibold disabled:opacity-60"
          >
            {listFetching ? "Loading…" : hasMore ? "Load More" : "No More"}
          </button>
        </div>
      )}

      {/* Yorum & Yıldız (review) */}
      <div className="write-review w-full mt-6">
        <h1 className="text-2xl font-medium text-qblack mb-5">Write Your Comment</h1>

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
          <div className="sm:flex sm:space-x-[30px] items-center mb-5">
            <div className="sm:w-1/3 w-full">
              <InputCom
                label="Name"
                type="text"
                name="name"
                inputClasses="h-[50px]"
                value={name}
                inputHandler={(e) => setName(e.target.value)}
              />
            </div>
            <div className="sm:w-1/3 w-full mt-5 sm:mt-0">
              <InputCom
                label="Email"
                type="email"
                name="email"
                inputClasses="h-[50px]"
                value={email}
                inputHandler={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="sm:w-1/3 w-full mt-5 sm:mt-0">
              <InputCom
                label="Phone"
                type="text"
                name="phone"
                inputClasses="h-[50px]"
                value={phone}
                inputHandler={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full mb-[20px]">
            <h6 className="input-label text-qgray capitalize text-[13px] font-normal block mb-2">
              Message*
            </h6>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              cols="30"
              rows="4"
              className="w-full focus:ring-0 focus:outline-none p-4 border border-qgray-border"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={submitComment}
              type="button"
              disabled={disabled}
              className="black-btn w-[260px] h-[50px] flex justify-center items-center disabled:opacity-60"
            >
              <span className="flex space-x-2 items-center h-full">
                <span className="text-sm font-semibold">
                  {sending ? "Sending…" : "Submit"}
                </span>
                {sending && (
                  <span className="w-5" style={{ transform: "scale(0.3)" }}>
                    <LoaderStyleOne />
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Reviews.propTypes = {
  productId: PropTypes.string.isRequired,
  className: PropTypes.string,
};
