// src/components/Sellers/SellerApply.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import InputCom from "@/components/Helpers/InputCom";
import {
  useGetMySellerQuery,
  useUpdateSellerPublicMutation,
  useApplyAsSellerMutation,
} from "@/api-manage/api-call-functions/public/publicSeller.api";

const MAX_IMG = 5 * 1024 * 1024;

const splitName = (full = "") => {
  const parts = String(full || "").trim().split(/\s+/);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ") || "";
  return [first, last];
};

const pickFirstImageUrl = (images) => {
  const i = Array.isArray(images) && images[0] ? images[0] : null;
  return i?.thumbnail || i?.url || i?.webp || null;
};

export default function SellerApply() {
  const { data: mySeller, refetch } = useGetMySellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const myId = mySeller?._id || mySeller?.id;

  const [updateSeller, { isLoading: isSaving }] = useUpdateSellerPublicMutation();
  const [applyAsSeller, { isLoading: isApplying }] = useApplyAsSellerMutation();

  // --- Form fields ---
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [country,   setCountry]   = useState("");
  const [address,   setAddress]   = useState("");
  const [shopName,  setShopName]  = useState("");

  // --- Images (preview only – backend public PUT görsel kabul etmiyor) ---
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview,  setCoverPreview]  = useState(null);
  const avatarInputRef = useRef(null);
  const coverInputRef  = useRef(null);

  // Mevcut seller verisinden formu doldur
  useEffect(() => {
    if (!mySeller) return;
    const [fn, ln] = splitName(mySeller?.contactName || mySeller?.user?.name || "");

    setFirstName(fn);
    setLastName(ln);
    setEmail(mySeller?.email || "");
    setPhone(mySeller?.phone || "");
    setCountry(mySeller?.location?.country || "");
    setAddress(mySeller?.addresses?.[0]?.addressLine || "");
    setShopName(mySeller?.companyName || mySeller?.displayName || "");

    // görsel önizleme
    setAvatarPreview(mySeller?.avatarUrl || pickFirstImageUrl(mySeller?.images));
    setCoverPreview(mySeller?.coverUrl || null);
  }, [mySeller]);

  const hasMySeller = !!myId;

  const onPickAvatar = () => avatarInputRef.current?.click();
  const onPickCover  = () => coverInputRef.current?.click();

  const onFileToPreview = (file, setter) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return toast.error("Sadece resim dosyası.");
    if (file.size > MAX_IMG) return toast.error("Görsel 5MB’dan büyük olamaz.");
    const r = new FileReader();
    r.onload = (e) => setter(e.target?.result || null);
    r.readAsDataURL(file);
  };

  const onAvatarChange = (e) => onFileToPreview(e.target.files?.[0], setAvatarPreview);
  const onCoverChange  = (e) => onFileToPreview(e.target.files?.[0], setCoverPreview);

  const canSubmit = useMemo(() => {
    // başvuru veya güncelleme için minimum alanlar
    return (email?.trim() && (shopName?.trim() || firstName?.trim()));
  }, [email, shopName, firstName]);

  const onSubmit = async () => {
    try {
      if (hasMySeller) {
        const payload = {
          id: myId,
          companyName: shopName,
          contactName: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          // country & address backend’de ayrı alanlar ise burada genişletilebilir.
          notes: "Self update via seller application",
        };
        await updateSeller(payload).unwrap();
        toast.success("Seller bilgileri güncellendi.");
        await refetch();
      } else {
        // auth’lu kullanıcılar için apply; anonim ise önce register-email akışı gerekir
        const payload = {
          shopName,
          phone,
          notes: "Seller portal register",
        };
        await applyAsSeller(payload).unwrap();
        toast.success("Başvuru alındı. Seller kaydınız oluşturuldu.");
        await refetch();
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || "İşlem başarısız.";
      toast.error(msg);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Form */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-2">Seller Information</h2>
        <p className="text-qgraytwo mb-6">
          Formu doldurun; mümkün olduğunca eksiksiz olsun.
        </p>

        {/* Name row */}
        <div className="flex gap-3 mb-6">
          <InputCom label="First Name*" value={firstName} onChange={(e)=>setFirstName(e.target.value)} inputClasses="h-[50px]" />
          <InputCom label="Last Name*"  value={lastName}  onChange={(e)=>setLastName(e.target.value)}  inputClasses="h-[50px]" />
        </div>

        {/* Email / Phone */}
        <div className="flex gap-3 mb-6">
          <InputCom label="Email*" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} inputClasses="h-[50px]" />
          <InputCom label="Phone*" value={phone} onChange={(e)=>setPhone(e.target.value)} inputClasses="h-[50px]" />
        </div>

        {/* Country */}
        <div className="mb-6">
          <InputCom label="Country" value={country} onChange={(e)=>setCountry(e.target.value)} inputClasses="h-[50px]" />
        </div>

        {/* Address */}
        <div className="mb-10">
          <InputCom label="Address" value={address} onChange={(e)=>setAddress(e.target.value)} inputClasses="h-[50px]" />
        </div>

        <h3 className="text-xl font-semibold mb-4">Shop Information</h3>
        <div className="mb-6">
          <InputCom label="Shop Name*" value={shopName} onChange={(e)=>setShopName(e.target.value)} inputClasses="h-[50px]" />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSaving || isApplying}
            className="w-[180px] h-[50px] bg-qblack text-white disabled:opacity-60"
          >
            {hasMySeller ? (isSaving ? "Updating..." : "Update") : (isApplying ? "Applying..." : "Apply")}
          </button>

          {!hasMySeller && (
            <div className="text-sm text-qgraytwo">
              Zaten kayıtlıysanız lütfen giriş yapın; aksi halde başvuru oluşturulur.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Profile / Logo / Cover */}
      <div className="lg:col-span-1">
        <div className="mb-10">
          <h4 className="text-xl font-bold mb-1">Update Profile</h4>
          <p className="text-sm text-qgraytwo mb-4">
            En az 300×300, max 5MB.
          </p>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-[198px] h-[198px] rounded-full overflow-hidden bg-gray-100">
                <img
                  src={avatarPreview || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/edit-profileimg.jpg`}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
              <button
                type="button"
                onClick={onPickAvatar}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-qblack text-white grid place-items-center"
                title="Pick image"
              >
                ✎
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-qred">
            Not: Görsel yükleme public endpoint’te henüz kapalı. Sadece önizleme yapılır.
          </p>
        </div>

        <div className="mb-10">
          <h4 className="text-xl font-bold mb-1">Update Cover</h4>
          <p className="text-sm text-qgraytwo mb-4">
            Önerilen 1170×920, max 5MB.
          </p>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-[260px] h-[150px] rounded overflow-hidden bg-gray-100">
                <img
                  src={coverPreview || `${import.meta.env.VITE_PUBLIC_URL}/assets/images/sallers-cover-1.png`}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={onCoverChange} />
              <button
                type="button"
                onClick={onPickCover}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-qblack text-white grid place-items-center"
                title="Pick image"
              >
                ✎
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-qred">
            Not: Cover yükleme public endpoint’te henüz kapalı.
          </p>
        </div>
      </div>
    </div>
  );
}
