// src/components/Profile/Dashboard.jsx
import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";
import { useListUserAddressesQuery } from "@/api-manage/api-call-functions/public/publicAddress.api";
import { useGetMySellerQuery } from "@/api-manage/api-call-functions/public/publicSeller.api";

/* ---------- helpers ---------- */
// Genel telefon okuyucu (hem düz objeden hem nested contact/phones dizisinden okur)
const readPhone = (obj) => {
  if (!obj) return "";
  return (
    obj.phone ||
    obj.phoneNumber ||
    obj.mobile ||
    obj.contact?.phone ||
    obj.contacts?.primaryPhone ||
    obj.contactPhone ||
    obj.addressPhone ||
    (Array.isArray(obj.phones)
      ? (obj.phones.find((p) => p?.isPrimary)?.number || obj.phones[0]?.number)
      : "") ||
    ""
  );
};

// Adres objesini normalize et (bazı kayıtlarda { address: {...} } olabilir)
const normalizeAddress = (a) => (a?.address ? a.address : a) ?? null;

const toCityCountry = (addrInput) => {
  const a = normalizeAddress(addrInput);
  if (!a) return "—";
  const city    = a.city || a.town || a.locality;
  const country = a.country || a.countryCode;
  if (city && country) return `${city}, ${country}`;
  return city || country || "—";
};

const toZip = (addrInput) => {
  const a = normalizeAddress(addrInput);
  return a?.postalCode || a?.zip || a?.postcode || "—";
};

// Kullanıcı telefonu: me → me.address → adres listesi (home → isPrimary → shipping → billing → herhangi)
const getUserPhone = (me, addresses) => {
  const fromMe = readPhone(me) || readPhone(me?.address);
  if (fromMe) return fromMe;

  if (!Array.isArray(addresses) || addresses.length === 0) return "";

  const getAddrPhone = (a) => readPhone(a) || readPhone(a?.address) || "";
  const pickBy = (pred) => addresses.find((a) => pred(a) && getAddrPhone(a));

  const candidate =
    pickBy((a) => a?.addressType === "home") ||
    pickBy((a) => a?.isPrimary) ||
    pickBy((a) => a?.addressType === "shipping") ||
    pickBy((a) => a?.addressType === "billing") ||
    addresses.find((a) => getAddrPhone(a));

  return candidate ? getAddrPhone(candidate) : "";
};

export default function Dashboard() {
  /* USER (account/me) */
  const { data: meRaw, isLoading: meLoading, isError: meError } = useMeQuery();
  const me = meRaw?.data ?? meRaw ?? null;

  const isLoggedIn = !!(me?.id || me?._id || me?.email);

  // ROLLER
  const roles = Array.isArray(me?.roles) ? me.roles : (me?.role ? [me.role] : []);
  const isSeller = roles.includes("seller");

  /* USER addresses */
  const {
    data: addrRaw,
    isLoading: addrLoading,
    isError: addrError,
  } = useListUserAddressesQuery(undefined, { skip: !isLoggedIn });

  const addresses = Array.isArray(addrRaw?.data) ? addrRaw.data : (addrRaw ?? []);

  /* SELLER (shop) – sadece seller ise çağır */
  const {
    data: sellerRaw,
    isLoading: sellerLoading,
    isError: sellerError,
  } = useGetMySellerQuery(undefined, {
    skip: !isLoggedIn || !isSeller,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const mySeller = sellerRaw?.data ?? sellerRaw ?? null;
  const hasShop = !!(mySeller?._id || mySeller?.id);

  /* ---- localStorage override (ProfileTab ile aynı anahtar) ---- */
  const meId = me?.id || me?._id || me?.userId || me?.email || null;
  const LS_KEY = meId ? `profile_overrides:${meId}` : null;
  let overrides = null;
  try {
    if (typeof window !== "undefined" && LS_KEY) {
      const raw = localStorage.getItem(LS_KEY);
      overrides = raw ? JSON.parse(raw) : null;
    }
  } catch {
    overrides = null;
  }

  /* ---- USER helpers ---- */
  const fullName =
    me?.name ||
    [me?.firstName, me?.lastName].filter(Boolean).join(" ") ||
    "—";

  const greetName =
    (me?.name?.split(" ")?.[0] ??
      me?.firstName ??
      (fullName !== "—" ? fullName : "there")) || "there";

  const email = me?.email || "—";

  // ✔ telefon: me / addresses / localStorage sırasıyla
  const phone = getUserPhone(me, addresses) || overrides?.phone || "—";

  const pickUserPrimary = () => {
    if (!Array.isArray(addresses)) {
      return { shipping: null, billing: null, primary: null };
    }
    const shipping = addresses.find((a) => a?.addressType === "shipping");
    const billing  = addresses.find((a) => a?.addressType === "billing");
    return {
      shipping: shipping || null,
      billing:  billing  || null,
      primary:  shipping || billing || addresses[0] || null,
    };
  };

  const { primary: userPrimary } = pickUserPrimary();
  const meAddress = normalizeAddress(me?.address);

  const personalCityCountry =
    addrError
      ? "—"
      : userPrimary
        ? toCityCountry(userPrimary)
        : meAddress
          ? toCityCountry(meAddress)
          : "—";

  const personalZip =
    addrError
      ? "—"
      : userPrimary
        ? toZip(userPrimary)
        : meAddress
          ? toZip(meAddress)
          : "—";

  /* ---- SELLER helpers ---- */
  const sellerAddresses = Array.isArray(mySeller?.addresses) ? mySeller.addresses : [];

  const pickSellerPrimary = () => {
    const billing  = sellerAddresses.find((a) => a?.addressType === "billing");
    const shipping = sellerAddresses.find((a) => a?.addressType === "shipping");
    return {
      billing:  billing || null,
      shipping: shipping || null,
      primary:  billing || shipping || sellerAddresses[0] || null,
    };
  };
  const { primary: shopPrimary } = pickSellerPrimary();

  const shopName    = mySeller?.companyName || mySeller?.displayName || mySeller?.shopName || "—";
  const shopContact = mySeller?.contactName || "—";
  const shopEmail   = mySeller?.email || "—";
  const shopPhone   =
    mySeller?.phone ||
    mySeller?.contact?.phone ||
    (Array.isArray(mySeller?.phones)
      ? (mySeller.phones.find((p) => p?.isPrimary)?.number || mySeller.phones[0]?.number)
      : "") ||
    "—";

  const loadingAny = meLoading || addrLoading || (isSeller && sellerLoading);
  const loadingText = loadingAny ? "Loading..." : (meError ? "Hello" : `Hello, ${greetName}`);

  return (
    <>
      <div className="welcome-msg w-full">
        <div>
          <p className="text-qblack text-lg">{loadingText}</p>
          <h1 className="font-bold text-[24px] text-qblack">Welcome to your Profile</h1>
        </div>
      </div>

      {/* Quick stats – örnek */}
      <div className="quick-view-grid w-full flex justify-between items-center mt-3">
        <div className="qv-item w-[252px] h-[208px] bg-qblack group hover:bg-qyellow transition-all duration-300 ease-in-out p-6">
          <div className="w-[62px] h-[62px] rounded bg-white flex justify-center items-center"><span /></div>
          <p className="text-xl text-white group-hover:text-qblacktext mt-5">New Orders</p>
          <span className="text-[40px] text-white group-hover:text-qblacktext font-bold leading-none mt-1 block">656</span>
        </div>
        <div className="qv-item w-[252px] h-[208px] bg-qblack group hover:bg-qyellow transition-all duration-300 ease-in-out p-6">
          <div className="w-[62px] h-[62px] rounded bg-white flex justify-center items-center"><span /></div>
          <p className="text-xl text-white group-hover:text-qblacktext mt-5">Pending</p>
          <span className="text-[40px] text-white group-hover:text-qblacktext font-bold leading-none mt-1 block">12</span>
        </div>
        <div className="qv-item w-[252px] h-[208px] bg-qblack group hover:bg-qyellow transition-all duration-300 ease-in-out p-6">
          <div className="w-[62px] h-[62px] rounded bg-white flex justify-center items-center"><span /></div>
          <p className="text-xl text-white group-hover:text-qblacktext mt-5">Messages</p>
          <span className="text-[40px] text-white group-hover:text-qblacktext font-bold leading-none mt-1 block">3</span>
        </div>
      </div>

      {/* INFO */}
      <div className="dashboard-info mt-8 flex items-start bg-primarygray px-7 py-7">
        {/* Personal Information */}
        <div className="flex-1 min-w-0">
          <p className="title text-[22px] font-semibold">Personal Information</p>
          <div className="mt-5">
            <table className="table-auto">
              <tbody>
                <tr className="align-top h-8">
                  <td className="text-base text-qgraytwo w-[120px] pr-4">Name:</td>
                  <td className="text-base text-qblack font-medium">{fullName}</td>
                </tr>
                <tr className="align-top h-8">
                  <td className="text-base text-qgraytwo w-[120px] pr-4">Email:</td>
                  <td className="text-base text-qblack font-medium break-all">{email}</td>
                </tr>
                <tr className="align-top h-8">
                  <td className="text-base text-qgraytwo w-[120px] pr-4">Phone:</td>
                  <td className="text-base text-qblack font-medium">{phone}</td>
                </tr>
                <tr className="align-top h-8">
                  <td className="text-base text-qgraytwo w-[120px] pr-4">City:</td>
                  <td className="text-base text-qblack font-medium">
                    {addrError ? "—" : personalCityCountry}
                  </td>
                </tr>
                <tr className="align-top h-8">
                  <td className="text-base text-qgraytwo w-[120px] pr-4">Zip:</td>
                  <td className="text-base text-qblack font-medium">
                    {addrError ? "—" : personalZip}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Divider + Shop Info (yalnızca seller varsa) */}
        {hasShop && (
          <>
            <div className="mx-6 w-[1px] self-stretch bg-[#E4E4E4]" />
            <div className="flex-1 min-w-0">
              <p className="title text-[22px] font-semibold">Shop Info</p>
              <div className="mt-5">
                <table className="table-auto">
                  <tbody>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">Company:</td>
                      <td className="text-base text-qblack font-medium">{shopName}</td>
                    </tr>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">Contact:</td>
                      <td className="text-base text-qblack font-medium">{shopContact}</td>
                    </tr>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">Email:</td>
                      <td className="text-base text-qblack font-medium break-all">{shopEmail}</td>
                    </tr>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">Phone:</td>
                      <td className="text-base text-qblack font-medium">{shopPhone}</td>
                    </tr>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">City:</td>
                      <td className="text-base text-qblack font-medium">
                        {sellerError ? "—" : toCityCountry(shopPrimary)}
                      </td>
                    </tr>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">Zip:</td>
                      <td className="text-base text-qblack font-medium">
                        {sellerError ? "—" : toZip(shopPrimary)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
