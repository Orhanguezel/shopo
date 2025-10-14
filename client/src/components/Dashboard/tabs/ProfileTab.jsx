// src/components/Profile/tabs/ProfileTab.jsx
import { useRef, useState, useEffect, useMemo } from "react";
import InputCom from "@/components/Helpers/InputCom";
import { toast } from "react-toastify";

// ACCOUNT rotaları
import {
  useMeQuery,
  useAccountUpdateMutation,
  useAccountUploadProfileImageMutation,
  useAccountRemoveProfileImageMutation,
} from "@/api-manage/api-call-functions/public/publicAuth.api";

// Adres modülü
import {
  useListUserAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation, // ✅ eklendi (adı farklıysa sizdeki ada uyarlayın)
} from "@/api-manage/api-call-functions/public/publicAddress.api";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const isNonEmpty = (v) => (typeof v === "string" ? v.trim() !== "" : v != null);
const trimOrEmpty = (v) => (typeof v === "string" ? v.trim() : "");

// Telefon normalizer
const pickPhone = (m) => {
  if (!m) return "";
  return (
    m.phone ||
    m.phoneNumber ||
    m.mobile ||
    m.contact?.phone ||
    m.contacts?.primaryPhone ||
    (Array.isArray(m.phones)
      ? (m.phones.find((p) => p?.isPrimary)?.number || m.phones[0]?.number)
      : "") ||
    ""
  );
};

// Adres normalizer (me.address)
const pickMeAddress = (m) => {
  const a = m?.address ?? {};
  return {
    addressLine: a.addressLine || a.line1 || a.street || "",
    city: a.city || "",
    zip: a.zip || a.postalCode || a.postcode || "",
    country: a.country || a.countryCode || "",
  };
};

export default function ProfileTab() {
  /* -------- Me + Adresler -------- */
  const { data: me, refetch } = useMeQuery();

  const meId = me?.id || me?._id || null;
  const isLoggedIn = !!meId;

  const { data: addrRaw, refetch: refetchAddresses } = useListUserAddressesQuery(undefined, {
    skip: !isLoggedIn,
  });

  const addresses = useMemo(
    () => (Array.isArray(addrRaw?.data) ? addrRaw.data : addrRaw ?? []),
    [addrRaw]
  );

  /* -------- Mutations -------- */
  const [accountUpdate, { isLoading }] = useAccountUpdateMutation();
  const [uploadProfileImage, { isLoading: isUploading }] = useAccountUploadProfileImageMutation();
  const [removeProfileImage, { isLoading: isRemoving }] = useAccountRemoveProfileImageMutation();
  const [createAddress, { isLoading: isCreatingAddr }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddr }] = useUpdateAddressMutation(); // ✅

  /* -------- Form State -------- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [country, setCountry]     = useState("");
  const [address, setAddress]     = useState(""); // addressLine
  const [city, setCity]           = useState("");
  const [zip, setZip]             = useState("");

  // Avatar preview & file
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const profileImgInput = useRef(null);

  // LocalStorage anahtarı
  const LS_KEY = meId ? `profile_overrides:${meId}` : null;

  const splitName = (full = "") => {
    const parts = String(full).trim().split(/\s+/);
    const fn = parts[0] || "";
    const ln = parts.slice(1).join(" ") || "";
    return [fn, ln];
  };

  /* -------- me geldiğinde formu doldur -------- */
  useEffect(() => {
    if (!me) return;

    const [fn, ln] = splitName(me?.name || "");
    const serverPhone = pickPhone(me);
    const a = pickMeAddress(me);

    const server = {
      firstName: fn,
      lastName: ln,
      email: me?.email || "",
      phone: serverPhone,
      country: a.country,
      address: a.addressLine,
      city: a.city,
      zip: a.zip,
      avatarUrl: me?.profileImage?.url || me?.avatarUrl || null,
    };

    let overrides = {};
    try {
      if (LS_KEY) {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) overrides = JSON.parse(raw);
      }
    } catch {
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
    setProfileFile(null);
  }, [me, LS_KEY]);

  const saveLocalOverrides = (fields) => {
    if (!LS_KEY) return;
    try {
      const prev = localStorage.getItem(LS_KEY);
      const old = prev ? JSON.parse(prev) : {};
      const next = { ...old, ...fields };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      toast.error("Profil verisi kaydedilemedi.");
    }
  };

  /* -------- Avatar handlers -------- */
  const browseProfileImg = () => profileImgInput.current?.click();

  const profileImgChangeHandler = (e) => {
    const f = e?.target?.files?.[0];
    if (!f) return;

    if (!f.type?.startsWith("image/")) {
      toast.error("Sadece resim dosyaları yüklenebilir.");
      return;
    }
    if (f.size > MAX_AVATAR_SIZE) {
      toast.error("Resim 5MB'dan büyük olamaz.");
      return;
    }

    setProfileFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImg(ev.target?.result || null);
    reader.readAsDataURL(f);
  };

  const onRemovePhoto = async () => {
    try {
      await toast.promise(removeProfileImage().unwrap(), {
        pending: "Fotoğraf kaldırılıyor...",
        success: "Profil fotoğrafı kaldırıldı.",
        error: "Profil fotoğrafı kaldırılamadı.",
      });
      setProfileImg(null);
      setProfileFile(null);
      if (profileImgInput.current) profileImgInput.current.value = "";
      await refetch().catch(() => undefined);
      saveLocalOverrides({ avatarUrl: null });
    } catch (err) {
      const msg = err?.data?.message || err?.error || err?.message || "Profil fotoğrafı kaldırılamadı.";
      toast.error(msg);
    }
  };

  /* -------- Reset -------- */
  const resetFromMe = () => {
    if (!me) return;
    const [fn, ln] = splitName(me?.name || "");
    const a = pickMeAddress(me);
    setFirstName(fn || "");
    setLastName(ln || "");
    setEmail(me?.email || "");
    setPhone(pickPhone(me) || "");
    setCountry(a.country || "");
    setAddress(a.addressLine || "");
    setCity(a.city || "");
    setZip(a.zip || "");
    setProfileImg(me?.profileImage?.url || me?.avatarUrl || null);
    setProfileFile(null);
    if (profileImgInput.current) profileImgInput.current.value = "";
  };

  const onCancel = () => {
    resetFromMe();
    toast.info("Değişiklikler sıfırlandı.");
  };

  /* -------- Address upsert helper -------- */
  const upsertHomeAddress = async (addressPayload, { safeName, emailVal, phoneVal }) => {
    // home -> primary -> first
    const home =
      addresses.find((a) => String(a?.addressType).toLowerCase() === "home") ||
      addresses.find((a) => a?.isPrimary) ||
      addresses[0];

    // sadece dolu alanları gönder
    const body = {
      addressType: "home",
      isPrimary: true,
      ...(isNonEmpty(safeName)   ? { fullName: safeName, name: safeName } : {}),
      ...(isNonEmpty(emailVal)   ? { email: emailVal } : {}),
      ...(isNonEmpty(phoneVal)   ? { phone: phoneVal } : {}),
      ...(addressPayload?.addressLine ? { addressLine: addressPayload.addressLine, line1: addressPayload.addressLine } : {}),
      ...(addressPayload?.city       ? { city: addressPayload.city } : {}),
      ...(addressPayload?.postalCode ? { postalCode: addressPayload.postalCode, zip: addressPayload.zip } : {}),
      ...(addressPayload?.country    ? { country: addressPayload.country } : {}),
    };

    // hiçbir alan yoksa boşuna çağırma
    const hasAny =
      body.fullName || body.email || body.phone ||
      body.addressLine || body.city || body.postalCode || body.country;
    if (!hasAny) return;

    try {
      if (home && (home._id || home.id)) {
        // UPDATE
        await updateAddress({
          id: home._id || home.id,
          body,
        }).unwrap();
      } else {
        // CREATE
        await createAddress(body).unwrap();
      }
      await refetchAddresses().catch(() => undefined);
    } catch (e) {
      console.error("upsertHomeAddress failed:", e);
      toast.error("Adres kaydedilemedi.");
    }
  };

  /* -------- Update -------- */
  const getErrMsg = (err) =>
    err?.data?.message || err?.error || err?.message || "Profil güncellenemedi.";

  const onUpdate = async () => {
    const safeFirst = trimOrEmpty(firstName);
    const safeLast  = trimOrEmpty(lastName);
    const safeName  = `${safeFirst} ${safeLast}`.trim();

    const aLine    = trimOrEmpty(address);
    const aCity    = trimOrEmpty(city);
    const aZip     = trimOrEmpty(zip);
    const aCountry = trimOrEmpty(country);
    const phoneVal = trimOrEmpty(phone);
    const emailVal = trimOrEmpty(email);

    // City/zip/country dolu ama addressLine boşsa uyar.
    if (!aLine && (aCity || aZip || aCountry)) {
      toast.error("Address satırı zorunludur (Street, number...).");
      return;
    }

    const addressPayload = aLine
      ? {
          addressLine: aLine,
          line1: aLine,
          city: aCity || undefined,
          postalCode: aZip || undefined,
          zip: aZip || undefined,
          country: aCountry || undefined,
        }
      : undefined;

    const payload = {
      ...(safeName ? { name: safeName } : {}),
      ...(phoneVal ? { phone: phoneVal } : {}),
      ...(addressPayload ? { address: addressPayload } : {}),
    };

    try {
      await toast.promise(accountUpdate(payload).unwrap(), {
        pending: "Profil güncelleniyor...",
        success: "Profil güncellendi.",
        error: { render: ({ data }) => getErrMsg(data) },
      });

      // Fotoğraf
      if (profileFile) {
        await toast.promise(
          uploadProfileImage({ file: profileFile }).unwrap(),
          {
            pending: "Fotoğraf yükleniyor...",
            success: "Profil fotoğrafı güncellendi.",
            error: "Profil fotoğrafı yüklenemedi.",
          }
        );
        if (profileImgInput.current) profileImgInput.current.value = "";
      }

      // ✅ Adres defterinde HOME kaydını oluştur/güncelle (eksik alanları tamamla)
      await upsertHomeAddress(addressPayload, { safeName, emailVal, phoneVal });

      await refetch().catch(() => undefined);

      // Local override’ları güncelle
      saveLocalOverrides({
        firstName, lastName, phone, country, address, city, zip,
        avatarUrl: profileImg || null,
      });

      toast.success("Adres defteriniz güncellendi.");
    } catch (err) {
      toast.error(getErrMsg(err));
      console.error("Update profile failed:", err);
    }
  };

  /* -------- Render -------- */
  const isBusy = isLoading || isUploading || isRemoving || isCreatingAddr || isUpdatingAddr;

  return (
    <>
      <div className="flex space-x-8">
        <div className="w-[570px]">
          <div className="input-item flex space-x-2.5 mb-8">
            <div className="w-1/2 h-full">
              <InputCom
                label="First Name*"
                placeholder="Demo Name"
                type="text"
                inputClasses="h-[50px]"
                name="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="w-1/2 h-full">
              <InputCom
                label="Last Name*"
                placeholder="Demo Surname"
                type="text"
                inputClasses="h-[50px]"
                name="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-item flex space-x-2.5 mb-8">
            <div className="w-1/2 h-full">
              <InputCom
                label="Email*"
                placeholder="demo@email.com"
                type="email"
                inputClasses="h-[50px]"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                readOnly
              />
            </div>
            <div className="w-1/2 h-full">
              <InputCom
                label="Phone Number*"
                placeholder="+49 123 456"
                type="text"
                inputClasses="h-[50px]"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="input-item mb-8">
            <InputCom
              label="Country*"
              placeholder="country"
              type="text"
              inputClasses="h-[50px]"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="input-item mb-8">
            <InputCom
              label="Address*"
              placeholder="Street, number, etc."
              type="text"
              inputClasses="h-[50px]"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </div>

          <div className="input-item flex space-x-2.5 mb-8">
            <div className="w-1/2 h-full">
              <InputCom
                label="Town / City*"
                type="text"
                inputClasses="h-[50px]"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="w-1/2 h-full">
              <InputCom
                label="Postcode / ZIP*"
                type="text"
                inputClasses="h-[50px]"
                name="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="update-logo w-full mb-9">
            <h1 className="text-xl tracking-wide font-bold text-qblack flex items-center mb-2">
              Update Profile
              <span className="ml-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 0C4.47457 0 0 4.47791 0 10C0 15.5221 4.47791 20 10 20C15.5221 20 20 15.5221 20 10C19.9967 4.48126 15.5221 0.00669344 10 0ZM10 16.67C9.53815 16.67 9.16667 16.2985 9.16667 15.8367C9.16667 15.3748 9.53815 15.0033 10 15.0033C10.4618 15.0033 10.8333 15.3748 10.8333 15.8367C10.8333 16.2952 10.4618 16.67 10 16.67ZM11.6098 10.425C11.1078 10.7396 10.8132 11.2952 10.8333 11.8842V12.5033C10.8333 12.9652 10.4618 13.3367 10 13.3367C9.53815 13.3367 9.16667 12.9652 9.16667 12.5033V11.8842C9.14324 10.6861 9.76907 9.56827 10.8032 8.96586C11.4357 8.61781 11.7704 7.90161 11.6366 7.19545C11.5027 6.52276 10.9772 5.99732 10.3046 5.8668C9.40094 5.69946 8.5308 6.29853 8.36346 7.20214C8.34673 7.30254 8.33668 7.40295 8.33668 7.50335C8.33668 7.96519 7.9652 8.33668 7.50335 8.33668C7.0415 8.33668 6.67002 7.96519 6.67002 7.50335C6.67002 5.66265 8.16265 4.17001 10.0067 4.17001C11.8474 4.17001 13.34 5.66265 13.34 7.50669C13.3333 8.71821 12.674 9.83601 11.6098 10.425Z"
                    fill="#374557"
                    fillOpacity="0.6"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-sm text-qgraytwo mb-5">
              Profile of at least <span className="ml-1 text-qblack">300x300</span>. GIFs work too.
              <span className="ml-1 text-qblack">Max 5MB</span>.
            </p>

            <div className="flex xl:justify-center justify-start">
              <div className="relative">
                <div className="sm:w-[198px] sm:h-[198px] w-[199px] h-[199px] rounded-full overflow-hidden relative">
                  <img
                    src={
                      profileImg ||
                      `${import.meta.env.VITE_PUBLIC_URL}/assets/images/edit-profileimg.jpg`
                    }
                    alt=""
                    className="object-cover w-full h-full"
                  />
                </div>

                <input
                  ref={profileImgInput}
                  onChange={profileImgChangeHandler}
                  type="file"
                  className="hidden"
                  accept="image/*"
                />

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={browseProfileImg}
                    type="button"
                    className="px-3 py-2 bg-qblack text-white text-xs rounded disabled:opacity-60"
                    disabled={isUploading}
                    title="Change photo"
                  >
                    {isUploading ? "Uploading..." : "Change Photo"}
                  </button>

                  <button
                    onClick={onRemovePhoto}
                    type="button"
                    className="px-3 py-2 bg-qred text-white text-xs rounded disabled:opacity-60"
                    disabled={isRemoving}
                    title="Remove photo"
                  >
                    {isRemoving ? "Removing..." : "Remove Photo"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="action-area flex space-x-4 items-center">
        <button type="button" className="text-sm text-qred font-semibold" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="w-[164px] h-[50px] bg-qblack text-white text-sm disabled:opacity-60"
          onClick={onUpdate}
          disabled={isBusy}
        >
          {isBusy ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </>
  );
}
