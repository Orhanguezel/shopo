// src/components/Profile/Dashboard.jsx
import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";
import { useListUserAddressesQuery } from "@/api-manage/api-call-functions/public/publicAddress.api";
import { useGetMySellerQuery } from "@/api-manage/api-call-functions/public/publicSeller.api";

export default function Dashboard() {
  /* USER */
  const { data: me, isLoading: meLoading, isError: meError } = useMeQuery();
  const isLoggedIn = !!(me?.id || me?._id);
  //const roles = Array.isArray(me?.roles) ? me.roles : (me?.role ? [me.role] : []);
  //const mayBeSeller = roles.includes("seller"); // ipucu; asıl doğrulama /sellers/me

  /* USER addresses */
  const {
    data: addresses = [],
    isLoading: addrLoading,
    isError: addrError,
  } = useListUserAddressesQuery(undefined, { skip: !isLoggedIn });

  /* SELLER (shop) */
  const {
    data: mySeller,
    isLoading: sellerLoading,
    isError: sellerError,
  } = useGetMySellerQuery(undefined, {
    skip: !isLoggedIn, // login yoksa çağırma
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const hasShop = !!(mySeller?._id || mySeller?.id);

  /* ---- helpers ---- */
  const fullName =
    me?.name ||
    [me?.firstName, me?.lastName].filter(Boolean).join(" ") ||
    "—";

  const greetName =
    (me?.name?.split(" ")?.[0] ??
      me?.firstName ??
      (fullName !== "—" ? fullName : "there")) || "there";

  const email = me?.email || "—";
  const phone = me?.phone || "—";

  // user address helpers
  const pickUserPrimary = () => {
    const shipping = addresses.find((a) => a.addressType === "shipping");
    const billing  = addresses.find((a) => a.addressType === "billing");
    return {
      shipping: shipping || null,
      billing: billing || null,
      primary: shipping || billing || addresses[0] || null,
    };
  };
  const toCityCountry = (a) =>
    a ? (a.city && a.country ? `${a.city}, ${a.country}` : a.city || a.country || "—") : "—";
  const toZip = (a) => (a?.postalCode || a?.zip || a?.postcode || "—");

  const { primary: userPrimary } = pickUserPrimary();
  const personalCityCountry = toCityCountry(userPrimary);
  const personalZip = toZip(userPrimary);

  // seller address helpers (mySeller.addresses backend’de populate ediliyor)
  const sellerAddresses = Array.isArray(mySeller?.addresses) ? mySeller.addresses : [];
  const pickSellerPrimary = () => {
    const billing = sellerAddresses.find((a) => a.addressType === "billing");
    const shipping = sellerAddresses.find((a) => a.addressType === "shipping");
    return {
      billing: billing || null,
      shipping: shipping || null,
      primary: billing || shipping || sellerAddresses[0] || null,
    };
  };
  const { primary: shopPrimary } = pickSellerPrimary();

  // Shop info fields
  const shopName = mySeller?.companyName || mySeller?.displayName || "—";
  const shopContact = mySeller?.contactName || "—";
  const shopEmail = mySeller?.email || "—";
  const shopPhone = mySeller?.phone || "—";
  const shopCityCountry =
    (mySeller?.location?.city || mySeller?.location?.country)
      ? toCityCountry(mySeller?.location)
      : toCityCountry(shopPrimary);
  const shopZip =
    (mySeller?.location?.postalCode || mySeller?.location?.zip)
      ? (mySeller?.location?.postalCode || mySeller?.location?.zip)
      : toZip(shopPrimary);

  const loadingAny = meLoading || addrLoading || sellerLoading;
  const loadingText = loadingAny ? "Loading..." : (meError ? "Hello" : `Hello, ${greetName}`);

  return (
    <>
      <div className="welcome-msg w-full">
        <div>
          <p className="text-qblack text-lg">{loadingText}</p>
          <h1 className="font-bold text-[24px] text-qblack">Welcome to your Profile</h1>
        </div>
      </div>

      {/* Quick stats – örnek, değişmedi */}
      <div className="quick-view-grid w-full flex justify-between items-center mt-3">
        <div className="qv-item w-[252px] h-[208px] bg-qblack group hover:bg-qyellow transition-all duration-300 ease-in-out p-6">
          <div className="w-[62px] h-[62px] rounded bg-white flex justify-center items-center"><span /></div>
          <p className="text-xl text-white group-hover:text-qblacktext mt-5">New Orders</p>
          <span className="text-[40px] text-white group-hover:text-qblacktext font-bold leading-none mt-1 block">656</span>
        </div>
        <div className="qv-item w-[252px] h-[208px] bg-qblack group hover:bg-qyellow transition-all duration-300 ease-in-out p-6">
          <div className="w-[62px] h-[62px] rounded bg-white flex justify-center items-center"><span /></div>
          <p className="text-xl text-white group-hover:text-qblacktext mt-5">New Orders</p>
          <span className="text-[40px] text-white group-hover:text-qblacktext font-bold leading-none mt-1 block">656</span>
        </div>
        <div className="qv-item w-[252px] h-[208px] bg-qblack group hover:bg-qyellow transition-all duration-300 ease-in-out p-6">
          <div className="w-[62px] h-[62px] rounded bg-white flex justify-center items-center"><span /></div>
          <p className="text-xl text-white group-hover:text-qblacktext mt-5">New Orders</p>
          <span className="text-[40px] text-white group-hover:text-qblacktext font-bold leading-none mt-1 block">656</span>
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
                        {sellerError ? "—" : shopCityCountry}
                      </td>
                    </tr>
                    <tr className="align-top h-8">
                      <td className="text-base text-qgraytwo w-[120px] pr-4">Zip:</td>
                      <td className="text-base text-qblack font-medium">
                        {sellerError ? "—" : shopZip}
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
