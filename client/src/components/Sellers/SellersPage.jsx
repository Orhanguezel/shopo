import PageTitle from "../Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";
import SellerCard from "./SellerCard";
import {
  useListSellersPublicQuery,
  useGetMySellerQuery,
} from "@/api-manage/api-call-functions/public/publicSeller.api";
import { buildSellerVM, BG_COVERS, loadingArray } from "./sellerHelpers";
import { Link } from "react-router-dom";

export default function SellersPage() {
  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useListSellersPublicQuery(
    { isActive: true },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true }
  );

  const {
    data: mySeller,
    isFetching: isFetchingMe,
    isError: isMySellerErr,   // 401 → true
    refetch: refetchMySeller,
  } = useGetMySellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const myId = mySeller?._id || mySeller?.id;
  const hasMySeller = !!myId;

  const items = listData?.items || [];

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="sallers-page-wrapper w-full mb-[60px]">
        <PageTitle
          title="All Sellers"
          breadcrumb={[
            { name: "home", path: "/" },
            { name: "Sellers", path: "/sallers" },
          ]}
        />
      </div>

      <div className="content-wrapper w-full mb-[60px]">
        <div className="container-x mx-auto w-full">

          {/* --- My Seller (yalnızca error yoksa ve id varsa) --- */}
          {!isFetchingMe && !isMySellerErr && hasMySeller && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">My Seller</h2>
                <button
                  className="text-sm underline text-qblack/60"
                  onClick={() => refetchMySeller()}
                >
                  Yenile
                </button>
              </div>
              <div className="grid grid-cols-1">
                <SellerCard
                  {...buildSellerVM(mySeller, 0, BG_COVERS)}
                  aos="fade"
                />
              </div>
            </div>
          )}

          {/* --- Auth yoksa / seller yoksa CTA --- */}
          {!isFetchingMe && (isMySellerErr || !hasMySeller) && (
            <div className="mb-8 p-4 rounded border border-qgray/20 bg-gray-50 flex items-center justify-between">
              <div className="text-qblack">
                Satıcı mısınız? Hemen mağazanızı oluşturun.
              </div>
              <div className="flex gap-2">
                <Link to="/signup" className="yellow-btn px-4 h-[40px] flex items-center">
                  Satıcı Ol
                </Link>
                <Link to="/login" className="gray-btn px-4 h-[40px] flex items-center">
                  Giriş Yap
                </Link>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-[30px] gap-5">
              {loadingArray(4).map((i) => (
                <div
                  key={`loading-${i}`}
                  className="w-full sm:h-[328px] sm:p-[30px] p-5 bg-gray-100 animate-pulse rounded"
                >
                  <div className="h-full flex items-center justify-center text-qgray">
                    Loading sellers…
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="w-full p-5 bg-red-50 border border-red-200 rounded text-red-700">
              Satıcılar yüklenemedi.{" "}
              <button className="underline" onClick={() => refetch()}>
                Tekrar dene
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && items.length === 0 && (
            <div className="w-full p-5 bg-gray-50 border border-gray-200 rounded text-qgray">
              Şu anda listelenecek satıcı bulunamadı.
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && items.length > 0 && (
            <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-[30px] gap-5">
              {items.map((s, idx) => {
                const vm = buildSellerVM(s, idx, BG_COVERS);
                return <SellerCard key={vm.key} {...vm} />;
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
