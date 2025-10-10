import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import InputCom from "@/components/Helpers/InputCom";
import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";

/* USER (owner) */
import {
  useMeQuery,
  useUpdateProfileLiteMutation,
} from "@/api-manage/api-call-functions/public/publicAuth.api";

/* SELLER (shop) */
import {
  useGetMySellerQuery,
  useUpdateSellerPublicMutation,
  useApplyAsSellerMutation,
  useUploadSellerAvatarMutation,
  useUploadSellerLogoMutation,
  useUploadSellerCoverMutation,
} from "@/api-manage/api-call-functions/public/publicSeller.api";

/* NEW sections */
import CategoryMultiSelect from "./CategoryMultiSelect";
import BillingSection from "./BillingSection";

const MAX_IMG = 5 * 1024 * 1024;
const PUB = import.meta.env.VITE_PUBLIC_URL || "";
const COVER_UPLOAD_ENABLED = true;

/* helpers */
const splitName = (full = "") => {
  const parts = String(full || "").trim().split(/\s+/);
  return [parts[0] || "", parts.slice(1).join(" ") || ""];
};
const pickFirstImageUrl = (images) => {
  const i = Array.isArray(images) && images[0] ? images[0] : null;
  return i?.thumbnail || i?.url || i?.webp || null;
};
const isNonEmpty = (v) => (typeof v === "string" ? v.trim() !== "" : v != null);
const toInt = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : undefined; };
const clamp = (num, min, max) => typeof num === "number" ? Math.min(Math.max(num, min), max) : undefined;
const cleanIban = (v = "") => v.replace(/\s+/g, "").toUpperCase();
const firstTruthy = (...vals) => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim() !== "") return v.trim();
    if (v != null && v !== false) return v;
  }
  return undefined;
};
const getApiErrMsg = (err) => {
  const d = err?.data || err;
  if (typeof d === "string") return d;
  if (d?.message) return d.message;
  const firstFieldErr =
    d?.errors?.[0]?.msg || d?.errors?.[0]?.message || d?.error || d?.statusText;
  return firstFieldErr || "İşlem başarısız.";
};

export default function BecomeSaller() {
  /* ---------- OWNER (USER) ---------- */
  const { data: me, refetch: refetchMe } = useMeQuery();
  const [updateProfile, { isLoading: isSavingOwner }] =
    useUpdateProfileLiteMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [country,   setCountry]   = useState("");
  const [city,      setCity]      = useState("");
  const [address,   setAddress]   = useState("");
  const [zip,       setZip]       = useState("");

  const [profileImg, setProfileImg] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const profileImgInput = useRef(null);
  const [uploadAvatar, { isLoading: upA }] = useUploadSellerAvatarMutation();

  const meId = me?.id || me?._id;
  const LS_KEY = meId ? `profile_overrides:${meId}` : null;
  const isLoggedIn = !!meId;

  /* ---------- SHOP (SELLER) ---------- */
  const {
    data: mySeller,
    isFetching,
    isError,
    error,
    refetch: refetchSeller,
  } = useGetMySellerQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const is404 = !!error && (error.status === 404 || error.originalStatus === 404);
  const myId = mySeller?._id || mySeller?.id;
  const hasMySeller = !!myId;

  const [updateSeller, { isLoading: isSavingShop }] = useUpdateSellerPublicMutation();
  const [applyAsSeller, { isLoading: isApplying }]  = useApplyAsSellerMutation();

  const [shopName,       setShopName]       = useState("");
  const [shopKind,       setShopKind]       = useState("person");
  const [shopContact,    setShopContact]    = useState("");
  const [shopEmail,      setShopEmail]      = useState("");
  const [shopPhone,      setShopPhone]      = useState("");
  const [shopCountry,    setShopCountry]    = useState("");
  const [shopCity,       setShopCity]       = useState("");
  const [shopSlug,       setShopSlug]       = useState("");
  const [billingTaxNo,   setBillingTaxNo]   = useState("");
  const [billingIban,    setBillingIban]    = useState("");
  const [billingCurr,    setBillingCurr]    = useState("");
  const [billingPTDays,  setBillingPTDays]  = useState("");
  const [billingDueDOM,  setBillingDueDOM]  = useState("");
  const [shopTags,       setShopTags]       = useState("");
  const [shopNotes,      setShopNotes]      = useState("");

  const [selectedCatIds, setSelectedCatIds] = useState([]);  // string[]

  // media
  const [logoImg,  setLogoImg]  = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [logoFile,  setLogoFile]  = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const logoImgInput  = useRef(null);
  const coverImgInput = useRef(null);
  const [uploadLogo,  { isLoading: upL }] = useUploadSellerLogoMutation();
  const [uploadCover, { isLoading: upC }] = useUploadSellerCoverMutation();

  /* OWNER → form doldur */
  const fillOwnerFromMe = useCallback((u) => {
    if (!u) return;
    const [fn, ln] = splitName(u?.name || "");
    const server = {
      firstName: fn,
      lastName:  ln,
      email:     u?.email || "",
      phone:     u?.phone,
      country:   u?.address?.country,
      address:   u?.address?.line1 || u?.address?.street,
      city:      u?.address?.city,
      zip:       u?.address?.zip || u?.address?.postalCode,
      avatarUrl: u?.profileImage?.url || u?.avatarUrl || null,
    };

    let overrides = {};
    try { if (LS_KEY) { const raw = localStorage.getItem(LS_KEY); if (raw) overrides = JSON.parse(raw); } } catch {
      toast.error("Profil verisi okunamadı.");
    }

    const merged = {
      firstName: isNonEmpty(server.firstName) ? server.firstName : (overrides.firstName || ""),
      lastName:  isNonEmpty(server.lastName)  ? server.lastName  : (overrides.lastName  || ""),
      email:     isNonEmpty(server.email)     ? server.email     : (overrides.email     || ""),
      phone:     isNonEmpty(server.phone)     ? server.phone     : (overrides.phone     || ""),
      country:   isNonEmpty(server.country)   ? server.country   : (overrides.country   || ""),
      address:   isNonEmpty(server.address)   ? server.address   : (overrides.address   || ""),
      city:      isNonEmpty(server.city)      ? server.city      : (overrides.city      || ""),
      zip:       isNonEmpty(server.zip)       ? server.zip       : (overrides.zip       || ""),
      avatarUrl: server.avatarUrl || overrides.avatarUrl || null,
    };

    setFirstName(merged.firstName);
    setLastName(merged.lastName);
    setEmail(merged.email);
    setPhone(merged.phone || "");
    setCountry(merged.country || "");
    setAddress(merged.address || "");
    setCity(merged.city || "");
    setZip(merged.zip || "");
    setProfileImg(merged.avatarUrl || null);
    setAvatarFile(null);
    if (profileImgInput.current) profileImgInput.current.value = "";
  }, [LS_KEY]);

  /* SELLER → form doldur */
  const fillShopFromSeller = useCallback((s) => {
    if (!s) return;
    setShopName(s?.companyName || s?.displayName || "");
    setShopKind(s?.kind || "person");
    setShopContact(s?.contactName || `${firstName} ${lastName}`.trim());
    setShopEmail(s?.email || "");
    setShopPhone(s?.phone || "");
    setShopCountry(s?.location?.country || "");
    setShopCity(s?.location?.city || "");
    setShopSlug(s?.slug || "");
    setBillingTaxNo(s?.billing?.taxNumber || "");
    setBillingIban(s?.billing?.iban || "");
    setBillingCurr(s?.billing?.defaultCurrency || "");
    setBillingPTDays(isNonEmpty(s?.billing?.paymentTermDays) ? String(s.billing.paymentTermDays) : "");
    setBillingDueDOM(isNonEmpty(s?.billing?.defaultDueDayOfMonth) ? String(s.billing.defaultDueDayOfMonth) : "");
    setShopTags(Array.isArray(s?.tags) ? s.tags.join(", ") : "");
    setShopNotes(s?.notes || "");

    const avatar = s?.avatarUrl || pickFirstImageUrl(s?.images);
    setLogoImg(s?.logoUrl || avatar || null);
    setCoverImg(s?.coverUrl || null);
    setLogoFile(null); setCoverFile(null);
    if (logoImgInput.current)  logoImgInput.current.value = "";
    if (coverImgInput.current) coverImgInput.current.value = "";

    const incoming = Array.isArray(s?.categories) ? s.categories.map(String) : [];
    setSelectedCatIds(incoming);
  }, [firstName, lastName]);

  useEffect(() => { if (me) fillOwnerFromMe(me); }, [me, fillOwnerFromMe]);
  useEffect(() => { if (mySeller) fillShopFromSeller(mySeller); }, [mySeller, fillShopFromSeller]);

  /* AUTH değişimi */
  const authRef = useRef(null);
  useEffect(() => {
    const uid = me?.id || me?._id || null;
    if (authRef.current !== uid) {
      authRef.current = uid;
      if (!uid) {
        // logout
        setShopName(""); setShopKind("person"); setShopContact(""); setShopEmail(""); setShopPhone("");
        setShopCountry(""); setShopCity(""); setShopSlug("");
        setBillingTaxNo(""); setBillingIban(""); setBillingCurr(""); setBillingPTDays(""); setBillingDueDOM("");
        setShopTags(""); setShopNotes(""); setSelectedCatIds([]);
        setLogoImg(null); setCoverImg(null); setLogoFile(null); setCoverFile(null);
      } else {
        refetchSeller().catch(() => {});
      }
    }
  }, [me, refetchSeller]);

  /* inputs (images) */
  const validateImg = (file) => {
    if (!file?.type?.startsWith("image/")) { toast.error("Sadece resim dosyası."); return false; }
    if (file.size > MAX_IMG) { toast.error("Görsel 5MB’ı aşamaz."); return false; }
    return true;
  };
  const toDataURL = (file, setter) => {
    const r = new FileReader();
    r.onload = (e) => setter(e.target?.result || null);
    r.readAsDataURL(file);
  };
  const onProfileChange = (e) => { const f = e.target.files?.[0]; if (!f || !validateImg(f)) return; setAvatarFile(f); toDataURL(f, setProfileImg); };
  const onLogoChange    = (e) => { const f = e.target.files?.[0]; if (!f || !validateImg(f)) return; setLogoFile(f);  toDataURL(f, setLogoImg); };
  const onCoverChange   = (e) => { const f = e.target.files?.[0]; if (!f || !validateImg(f)) return; setCoverFile(f); toDataURL(f, setCoverImg); };

  const canSubmit = useMemo(
    () => (email?.trim() && (shopName?.trim() || firstName?.trim())) && selectedCatIds.length > 0,
    [email, shopName, firstName, selectedCatIds.length]
  );

  const onReset = () => {
    if (me) fillOwnerFromMe(me);
    if (mySeller) fillShopFromSeller(mySeller);
  };

  /* ---------- SUBMIT ---------- */
  const onSubmit = async () => {
    try {
      if (!selectedCatIds.length) { toast.error("Lütfen en az bir kategori seçin."); return; }

      // 1) OWNER (profil)
      const ownerPayload = {
        name: `${firstName} ${lastName}`.trim(),
        phone,
        address: { line1: address, city, zip, country },
      };

      await toast.promise(updateProfile(ownerPayload).unwrap(), {
        pending: "Kişisel profil güncelleniyor…",
        success: "Kişisel profil güncellendi.",
        error: "Kişisel profil güncellenemedi.",
      });

      if (avatarFile) {
        await toast.promise(uploadAvatar({ file: avatarFile }).unwrap(), {
          pending: "Profil resmi yükleniyor…",
          success: "Profil resmi güncellendi.",
          error: "Profil resmi yüklenemedi.",
        });
      }

      // 2) SHOP (seller)
      const ptd = toInt(billingPTDays);
      const due = clamp(toInt(billingDueDOM), 1, 28);
      const payloadCommon = {
        companyName: shopName?.trim(),
        kind: shopKind,
        contactName: firstTruthy(shopContact, `${firstName} ${lastName}`),
        email: firstTruthy(shopEmail, email),
        phone: firstTruthy(shopPhone, phone),
        location: {
          country: firstTruthy(shopCountry),
          city: firstTruthy(shopCity),
        },
        billing: {
          taxNumber: firstTruthy(billingTaxNo),
          iban: firstTruthy(cleanIban(billingIban)),
          defaultCurrency: firstTruthy(billingCurr),
          paymentTermDays: ptd,
          defaultDueDayOfMonth: due,
        },
        tags: (shopTags || "").split(",").map((t) => t.trim()).filter(Boolean),
        notes: firstTruthy(shopNotes),
        categories: selectedCatIds,
      };

      // boş nested'ları temizle
      if (!payloadCommon.location.country && !payloadCommon.location.city) delete payloadCommon.location;
      if (
        !payloadCommon.billing?.taxNumber &&
        !payloadCommon.billing?.iban &&
        !payloadCommon.billing?.defaultCurrency &&
        (payloadCommon.billing?.paymentTermDays == null) &&
        (payloadCommon.billing?.defaultDueDayOfMonth == null)
      ) delete payloadCommon.billing;
      if (!payloadCommon.tags?.length) delete payloadCommon.tags;

      if (hasMySeller) {
        await toast.promise(updateSeller({ id: myId, ...payloadCommon }).unwrap(), {
          pending: "Mağaza bilgileri güncelleniyor…",
          success: "Mağaza bilgileri güncellendi.",
          error: { render: ({ data }) => getApiErrMsg(data) },
        });

        if (logoFile) {
          await toast.promise(uploadLogo({ file: logoFile }).unwrap(), {
            pending: "Logo yükleniyor…",
            success: "Logo güncellendi.",
            error: "Logo yüklenemedi.",
          });
        }
        if (coverFile && COVER_UPLOAD_ENABLED) {
          await toast.promise(uploadCover({ file: coverFile }).unwrap(), {
            pending: "Kapak görseli yükleniyor…",
            success: "Kapak görseli güncellendi.",
            error: "Kapak görseli yüklenemedi.",
          });
        }
      } else {
        // 1) seller oluştur (min alanlarla)
        const created = await toast.promise(
          applyAsSeller({
            shopName: shopName?.trim(),
            phone: firstTruthy(shopPhone, phone),
            email: firstTruthy(shopEmail, email),
            notes: "Seller application",
            categories: selectedCatIds,
          }).unwrap(),
          {
            pending: "Başvurunuz gönderiliyor…",
            success: "Başvurunuz alındı. Seller kaydınız oluşturuldu.",
            error: { render: ({ data }) => getApiErrMsg(data) },
          }
        );

        const newId = created?.data?._id || created?.data?.id;
        // 2) Detayları hemen güncelle
        if (newId) {
          await updateSeller({ id: newId, ...payloadCommon }).unwrap().catch(() => {});
        }

        if (logoFile)   await uploadLogo({ file: logoFile }).unwrap().catch(() => {});
        if (coverFile && COVER_UPLOAD_ENABLED)
          await uploadCover({ file: coverFile }).unwrap().catch(() => {});
      }

      await Promise.all([refetchMe().catch(()=>{}), refetchSeller().catch(()=>{})]);
    } catch (err) {
      console.error("Seller submit error:", err);
      toast.error(getApiErrMsg(err));
    }
  };

  const isBusy = isFetching || isSavingOwner || isSavingShop || isApplying || upA || upL || upC;

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="become-saller-wrapper w-full">
        <div className="title mb-10">
          <PageTitle
            title="Seller Application"
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "Become Seller", path: "/become-saller" },
            ]}
          />
        </div>

        <div className="content-wrapper w-full mb-10">
          <div className="container-x mx-auto">
            {/* BANNERLAR */}
            {!isLoggedIn && (
              <div className="w-full mb-4 p-4 rounded bg-yellow-50 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span>Devam etmek için lütfen giriş yapın.</span>
                  <div className="flex gap-2">
                    <Link to="/login" className="gray-btn px-3 h-[36px] flex items-center">Giriş Yap</Link>
                    <Link to="/signup" className="yellow-btn px-3 h-[36px] flex items-center">Kayıt Ol</Link>
                  </div>
                </div>
              </div>
            )}

            {isLoggedIn && !isFetching && is404 && (
              <div className="w-full mb-4 p-4 rounded bg-blue-50 border border-blue-200">
                <span>Henüz bir mağaza hesabınız yok. Aşağıdan oluşturabilirsiniz.</span>
              </div>
            )}

            {isLoggedIn && !isFetching && isError && !is404 && (
              <div className="w-full mb-4 p-4 rounded bg-red-50 border border-red-200">
                <span>Mağaza bilgileri yüklenemedi: {getApiErrMsg(error)}</span>
              </div>
            )}

            {isFetching && (
              <div className="w-full mb-4 p-4 rounded bg-gray-50 border border-gray-200 animate-pulse">
                Yükleniyor…
              </div>
            )}

            <div className="w-full bg-white sm:p-[30px] p-3">
              <div className="flex xl:flex-row flex-col-reverse xl:space-x-11">
                {/* LEFT – FORMS */}
                <div className="xl:w-[824px]">
                  {/* Seller (Owner) Information */}
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-[22px] font-semibold text-qblack">Seller Information</h1>
                    <button
                      onClick={() => {
                        if (me) fillOwnerFromMe(me);
                        if (isLoggedIn) refetchSeller();
                      }}
                      className="text-sm underline text-qblack/60"
                    >
                      Sunucudan Yenile
                    </button>
                  </div>

                  <div className="input-area">
                    <div className="flex sm:flex-row flex-col gap-5 mb-5">
                      <InputCom label="First Name*" type="text" inputClasses="h-[50px]"
                                name="first_name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                      <InputCom label="Last Name*" type="text" inputClasses="h-[50px]"
                                name="last_name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
                    </div>

                    <div className="flex sm:flex-row flex-col gap-5 mb-5">
                      <InputCom label="Email*" type="email" inputClasses="h-[50px]"
                                name="email" value={email} onChange={(e)=>setEmail(e.target.value)} readOnly />
                      <InputCom label="Phone*" type="text" inputClasses="h-[50px]"
                                name="phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                    </div>

                    <div className="flex sm:flex-row flex-col gap-5 mb-5">
                      <InputCom label="Country*" type="text" inputClasses="h-[50px]"
                                name="country" value={country} onChange={(e)=>setCountry(e.target.value)} />
                      <InputCom label="Town / City*" type="text" inputClasses="h-[50px]"
                                name="city" value={city} onChange={(e)=>setCity(e.target.value)} />
                    </div>

                    <div className="flex sm:flex-row flex-col gap-5 mb-8">
                      <InputCom label="Address" type="text" inputClasses="h-[50px]"
                                name="address" value={address} onChange={(e)=>setAddress(e.target.value)} />
                      <InputCom label="Postcode / ZIP" type="text" inputClasses="h-[50px]"
                                name="zip" value={zip} onChange={(e)=>setZip(e.target.value)} />
                    </div>

                    {/* Shop (Seller) */}
                    <h2 className="text-[20px] font-semibold text-qblack mb-3">Shop Information</h2>

                    <div className="flex sm:flex-row flex-col gap-5 mb-5">
                      <div className="sm:w-1/3 w-full">
                        <label className="block text-sm font-semibold mb-2">Type</label>
                        <select
                          className="w-full border border-gray-200 h-[50px] px-3"
                          value={shopKind}
                          onChange={(e)=>setShopKind(e.target.value)}
                        >
                          <option value="person">Person</option>
                          <option value="organization">Organization</option>
                        </select>
                      </div>
                      <div className="sm:w-2/3 w-full">
                        <InputCom label="Shop / Company Name*" type="text" inputClasses="h-[50px]"
                                  name="shopname" value={shopName} onChange={(e)=>setShopName(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex sm:flex-row flex-col gap-5 mb-5">
                      <InputCom label="Contact Name" type="text" inputClasses="h-[50px]"
                                name="contact_name" value={shopContact} onChange={(e)=>setShopContact(e.target.value)} />
                      <InputCom label="Slug" type="text" inputClasses="h-[50px]"
                                name="slug" value={shopSlug} readOnly />
                    </div>

                    <div className="flex sm:flex-row flex-col gap-5 mb-5">
                      <InputCom label="Seller Email" type="email" inputClasses="h-[50px]"
                                name="shop_email" value={shopEmail} onChange={(e)=>setShopEmail(e.target.value)} />
                      <InputCom label="Seller Phone" type="text" inputClasses="h-[50px]"
                                name="shop_phone" value={shopPhone} onChange={(e)=>setShopPhone(e.target.value)} />
                    </div>

                    <div className="flex sm:flex-row flex-col gap-5 mb-8">
                      <InputCom label="Seller Country" type="text" inputClasses="h-[50px]"
                                name="shop_country" value={shopCountry} onChange={(e)=>setShopCountry(e.target.value)} />
                      <InputCom label="Seller City" type="text" inputClasses="h-[50px]"
                                name="shop_city" value={shopCity} onChange={(e)=>setShopCity(e.target.value)} />
                    </div>

                    {/* Categories */}
                    <CategoryMultiSelect
                      value={selectedCatIds}
                      onChange={setSelectedCatIds}
                    />

                    {/* Billing */}
                    <div className="mt-8">
                      <BillingSection
                        taxNo={billingTaxNo} setTaxNo={setBillingTaxNo}
                        iban={billingIban}   setIban={setBillingIban}
                        curr={billingCurr}   setCurr={setBillingCurr}
                        ptDays={billingPTDays} setPtDays={setBillingPTDays}
                        dueDom={billingDueDOM} setDueDom={setBillingDueDOM}
                      />
                    </div>

                    {/* Tags + Notes */}
                    <div className="mb-5">
                      <InputCom label="Tags (comma separated)" type="text" inputClasses="h-[50px]"
                                name="tags" value={shopTags} onChange={(e)=>setShopTags(e.target.value)} />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">Notes</label>
                      <textarea
                        className="w-full border border-gray-200 rounded p-3 min-h-[100px]"
                        value={shopNotes}
                        onChange={(e)=>setShopNotes(e.target.value)}
                        placeholder="Internal notes about your shop (optional)"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={onSubmit}
                        disabled={!canSubmit || isBusy || !isLoggedIn}
                        className="w-[220px] h-[50px] bg-qblack text-white disabled:opacity-60"
                      >
                        {hasMySeller
                          ? (isBusy ? "Updating..." : "Update Seller")
                          : (isBusy ? "Applying..." : "Create Seller Account")}
                      </button>
                    </div>

                    <div className="signup-area mt-6">
                      <p className="text-sm text-qgraytwo">
                        Already have an account?
                        <Link to="/login" className="ml-2 text-qblack">Log In</Link>
                        <span className="mx-2">/</span>
                        <Link to="/signup" className="text-qblack">Register</Link>
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT – IMAGES */}
                <div className="flex-1 mb-10 xl:mb-0">
                  {/* Profile */}
                  <div className="update-profile w-full mb-9">
                    <h3 className="text-xl font-bold mb-2">Update Profile</h3>
                    <p className="text-sm text-qgraytwo mb-5">Min 300×300, Max 5MB.</p>
                    <div className="flex xl:justify-center justify-start">
                      <div className="relative">
                        <img
                          src={profileImg || `${PUB}/assets/images/edit-profileimg.jpg`}
                          alt="profile"
                          className="sm:w-[198px] sm:h-[198px] w-[199px] h-[199px] rounded-full object-cover"
                        />
                        <input ref={profileImgInput} onChange={onProfileChange} type="file" className="hidden" accept="image/*" />
                        <button type="button" onClick={() => profileImgInput.current?.click()}
                                className="w-8 h-8 absolute bottom-7 sm:right-0 right-[105px] bg-qblack text-white rounded-full grid place-items-center"
                                title="Pick image">✎</button>
                      </div>
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="update-logo w-full mb-9">
                    <h3 className="text-xl font-bold mb-2">Update Logo</h3>
                    <p className="text-sm text-qgraytwo mb-5">Min 300×300, Max 5MB.</p>
                    <div className="flex xl:justify-center justify-start">
                      <div className="relative">
                        <img
                          src={logoImg || `${PUB}/assets/images/edit-logoimg.jpg`}
                          alt="logo"
                          className="sm:w-[198px] sm:h-[198px] w-[199px] h-[199px] rounded-full object-cover"
                        />
                        <input ref={logoImgInput} onChange={onLogoChange} type="file" className="hidden" accept="image/*" />
                        <button type="button" onClick={() => logoImgInput.current?.click()}
                                className="w-8 h-8 absolute bottom-7 sm:right-0 right-[105px] bg-qblack text-white rounded-full grid place-items-center"
                                title="Pick image">✎</button>
                      </div>
                    </div>
                  </div>

                  {/* Cover */}
                  <div className="update-cover w-full">
                    <h3 className="text-xl font-bold mb-2">Update Cover</h3>
                    <p className="text-sm text-qgraytwo mb-5">Önerilen 1170×920.</p>
                    <div className="flex justify-center">
                      <div className="w-full relative">
                        <img
                          src={coverImg || `${PUB}/assets/images/edit-coverimg.jpg`}
                          alt="cover"
                          className="w-full h-[120px] rounded-lg object-cover"
                        />
                        <input ref={coverImgInput} onChange={onCoverChange} type="file" className="hidden" accept="image/*" />
                        <button type="button" onClick={() => coverImgInput.current?.click()}
                                className="w-8 h-8 absolute -bottom-4 right-4 bg-qblack text-white rounded-full grid place-items-center"
                                title="Pick image">✎</button>
                      </div>
                    </div>
                  </div>

                  <div className="action-area flex space-x-4 items-center mt-6">
                    <button type="button" className="text-sm text-qred font-semibold"
                            onClick={onReset} disabled={isBusy}>Cancel</button>
                    <button type="button" className="w-[164px] h-[50px] bg-qblack text-white text-sm disabled:opacity-60"
                            onClick={onSubmit} disabled={!canSubmit || isBusy || !isLoggedIn}>
                      {isBusy ? "Updating..." : (hasMySeller ? "Update Seller" : "Create Seller")}
                    </button>
                  </div>
                </div>
                {/* /RIGHT */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
