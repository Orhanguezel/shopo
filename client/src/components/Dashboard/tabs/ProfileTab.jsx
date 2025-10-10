// src/components/Profile/tabs/ProfileTab.jsx
import { useRef, useState, useEffect } from "react";
import InputCom from "@/components/Helpers/InputCom";
import { toast } from "react-toastify";

// API (AuthLite + Account)
import {
  useMeQuery,
  useUpdateProfileLiteMutation,
  useAccountUploadProfileImageMutation,
  // useAccountRemoveProfileImageMutation, // (ileride “remove” butonu eklersen aç)
} from "@/api-manage/api-call-functions/public/publicAuth.api";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const isNonEmpty = (v) => (typeof v === "string" ? v.trim() !== "" : v != null);

export default function ProfileTab() {
  // Me verisi
  const { data: me, refetch } = useMeQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileLiteMutation();
  const [uploadProfileImage, { isLoading: isUploading }] =
    useAccountUploadProfileImageMutation();
  // const [removeProfileImage] = useAccountRemoveProfileImageMutation();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [country, setCountry]     = useState("");
  const [address, setAddress]     = useState("");
  const [city, setCity]           = useState("");
  const [zip, setZip]             = useState("");

  // Avatar preview & file
  const [profileImg, setProfileImg] = useState(null);   // url veya dataURL
  const [profileFile, setProfileFile] = useState(null); // File
  const profileImgInput = useRef(null);

  // LocalStorage anahtarı (id veya _id)
  const meId = me?.id || me?._id;
  const LS_KEY = meId ? `profile_overrides:${meId}` : null;

  const splitName = (full = "") => {
    const parts = String(full).trim().split(/\s+/);
    const fn = parts[0] || "";
    const ln = parts.slice(1).join(" ") || "";
    return [fn, ln];
  };

  // me geldiğinde formu doldur + local overrides
  useEffect(() => {
    if (!me) return;

    // Sunucu verisi
    const [fn, ln] = splitName(me?.name || "");
    const server = {
      firstName: fn,
      lastName:  ln,
      email:     me?.email || "",
      phone:     me?.phone,
      // AuthLite me minimal dönebilir; account/me kadar detaylı adres olmayabilir
      country:   me?.address?.country,
      address:   me?.address?.line1 || me?.address?.street,
      city:      me?.address?.city,
      zip:       me?.address?.zip || me?.address?.postalCode,
      avatarUrl: me?.profileImage?.url || me?.avatarUrl || null,
    };

    // Local overrides
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

  const resetFromMe = () => {
    if (!me) return;
    const [fn, ln] = splitName(me?.name || "");
    setFirstName(fn || "");
    setLastName(ln || "");
    setEmail(me?.email || "");
    setPhone(me?.phone || "");
    setCountry(me?.address?.country || "");
    setAddress(me?.address?.line1 || me?.address?.street || "");
    setCity(me?.address?.city || "");
    setZip(me?.address?.zip || me?.address?.postalCode || "");
    setProfileImg(me?.profileImage?.url || me?.avatarUrl || null);
    setProfileFile(null);
    if (profileImgInput.current) profileImgInput.current.value = "";
  };

  const onCancel = () => {
    resetFromMe();
    toast.info("Değişiklikler sıfırlandı.");
  };

  const getErrMsg = (err) =>
    err?.data?.message || err?.error || err?.message || "Profil güncellenemedi.";


const onUpdate = async () => {
  const payload = {
    name: `${firstName} ${lastName}`.trim(),
    phone,
    address: { line1: address, city, zip, country },
  };

  try {
    await toast.promise(updateProfile(payload).unwrap(), {
      pending: "Profil güncelleniyor...",
      success: "Profil güncellendi.",
      error: { render: ({ data }) => getErrMsg(data) },
    });

    if (profileFile) {
      // <-- TEK argüman: { file }
      await toast.promise(
        uploadProfileImage({ file: profileFile }).unwrap(),
        {
          pending: "Fotoğraf yükleniyor...",
          success: "Profil fotoğrafı güncellendi.",
          error: "Profil fotoğrafı yüklenemedi.",
        }
      );
    }

    await refetch().catch(() => undefined);
    saveLocalOverrides({
      firstName, lastName, phone, country, address, city, zip,
      avatarUrl: profileImg || null,
    });
  } catch (err) {
    toast.error(getErrMsg(err));
    console.error("Update profile failed:", err);
  }
};

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
                readOnly // e-posta değişimi ayrı akış (change-email)
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
              placeholder="your address here"
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
                <div
                  onClick={browseProfileImg}
                  className="w-[32px] h-[32px] absolute bottom-7 sm:right-0 right-[105px] bg-qblack rounded-full cursor-pointer"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5147 11.5C17.7284 12.7137 18.9234 13.9087 20.1296 15.115C19.9798 15.2611 19.8187 15.4109 19.6651 15.5683C17.4699 17.7635 15.271 19.9587 13.0758 22.1539C12.9334 22.2962 12.7948 22.4386 12.6524 22.5735C12.6187 22.6034 12.5663 22.6296 12.5213 22.6296C11.3788 22.6334 10.2362 22.6297 9.09365 22.6334C9.01498 22.6334 9 22.6034 9 22.536C9 21.4009 9 20.2621 9.00375 19.1271C9.00375 19.0746 9.02997 19.0109 9.06368 18.9772C10.4123 17.6249 11.7609 16.2763 13.1095 14.9277C14.2295 13.8076 15.3459 12.6913 16.466 11.5712C16.4884 11.5487 16.4997 11.5187 16.5147 11.5Z" fill="white"/>
                    <path d="M20.9499 14.2904C19.7436 13.0842 18.5449 11.8854 17.3499 10.6904C17.5634 10.4694 17.7844 10.2446 18.0054 10.0199C18.2639 9.76139 18.5261 9.50291 18.7884 9.24443C19.118 8.91852 19.5713 8.91852 19.8972 9.24443C20.7251 10.0611 21.5492 10.8815 22.3771 11.6981C22.6993 12.0165 22.7105 12.4698 22.3996 12.792C21.9238 13.2865 21.4443 13.7772 20.9686 14.2717C20.9648 14.2792 20.9536 14.2867 20.9499 14.2904Z" fill="white"/>
                  </svg>
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
          disabled={isLoading || isUploading}
        >
          {isLoading || isUploading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </>
  );
}
