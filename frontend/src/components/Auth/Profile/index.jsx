"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
// Redux imports
import { useDispatch } from "react-redux";
// Internal utility and middleware imports
import auth from "../../../utils/auth";
import { setWishlistData } from "../../../redux/features/wishlist/wishlistSlice";
// Shared and helper imports
import Multivendor from "../../Shared/Multivendor";
import ServeLangItem from "../../Helpers/ServeLangItem";
import BreadcrumbCom from "../../BreadcrumbCom";
// Icon imports
import IcoAdress from "./icons/IcoAdress";
import IcoCart from "./icons/IcoCart";
import IcoDashboard from "./icons/IcoDashboard";
import IcoLogout from "./icons/IcoLogout";
import IcoLove from "./icons/IcoLove";
import IcoPassword from "./icons/IcoPassword";
import IcoPeople from "./icons/IcoPeople";
import IcoReviewHand from "./icons/IcoReviewHand";
import IcoSupport from "./icons/IcoSupport";
// Tab component imports
import AddressesTab from "./tabs/AddressesTab";
import ReturnRequestsTab from "./tabs/ReturnRequestsTab";
import SellerOperationsTab from "./tabs/SellerOperationsTab";
import Dashboard from "./tabs/Dashboard";
import OrderTab from "./tabs/OrderTab";
import PasswordTab from "./tabs/PasswordTab";
import ProfileTab from "./tabs/ProfileTab";
import ReviewTab from "./tabs/ReviewTab";
import WishlistTab from "./tabs/WishlistTab";
import {
  useDashboardApiQuery,
  useOrderListApiQuery,
  useReturnRequestsApiQuery,
  useReviewListApiQuery,
  useProfileInfoApiQuery,
  useLazyLogoutApiQuery,
} from "@/redux/features/auth/apiSlice";
import appConfig from "@/appConfig";
import { toast } from "react-toastify";
import {
  useGetCountryListApiQuery,
  useGetStateListApiQuery,
  useGetCityListApiQuery,
} from "@/redux/features/locations/apiSlice";
import { deleteCookie } from "cookies-next";

// Main Profile component content
function ProfileContent() {
  // Next.js router and navigation hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Redux dispatch
  const dispatch = useDispatch();
  // Auth check state — hydration'dan sonra kontrol edilir
  const [authChecked, setAuthChecked] = useState(false);
  // State for switching to seller dashboard
  const [switchDashboard, setSwitchDashboard] = useState(false);
  // State for active tab (dashboard, profile, order, etc.)
  const [active, setActive] = useState("dashboard");

  // Auth kontrolünü client-side'da yap (hydration sonrası)
  useEffect(() => {
    if (!auth()) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, []);
  const [returnRequestFilters, setReturnRequestFilters] = useState({
    status: "all",
    search: "",
    reason: "",
    dateFrom: "",
    dateTo: "",
    perPage: 20,
  });

  // Set active tab based on URL hash (e.g., #dashboard, #profile, etc.)
  useEffect(() => {
    const getTabFromHash = () => {
      const rawHash = window.location.hash;
      // Birden fazla # birikmiş olabilir (#profile#address#order) — son segmenti al
      const segments = rawHash.split("#").filter(Boolean);
      return segments[segments.length - 1] || "dashboard";
    };

    setActive(getTabFromHash());

    // Aynı pathname'de hash değiştiğinde (tab tıklanınca) aktif tabı güncelle
    const handleHashChange = () => setActive(getTabFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname, searchParams]);

  // switch dashboard handler
  const switchDashboardHandler = () => {
    setSwitchDashboard(!switchDashboard);
  };

  // redirect to seller dashboard if switchDashboard is true
  useEffect(() => {
    if (switchDashboard) {
      const baseURL = appConfig.BASE_URL;
      const dashboardUrl = baseURL + "seller/dashboard";
      router.push(dashboardUrl);
    }
  }, [switchDashboard]);

  /**
   * Handles user logout functionality
   * @Initialization Logout Api @const logoutApi
   * @func logoutSuccessHandler @param data @param statusCode
   * @func logout
   */
  const [logoutApi, { isLoading: isLogoutLoading }] = useLazyLogoutApiQuery();

  const logoutSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      dispatch(setWishlistData(null));
      toast.success(data?.notification);
      localStorage.removeItem("auth");
      deleteCookie("access_token");
      router.push("/login");
    } else {
      // for force logout
      dispatch(setWishlistData(null));
      toast.success("Çıkış başarılı");
      localStorage.removeItem("auth");
      deleteCookie("access_token");
      router.push("/login");
    }
  };

  const logout = async () => {
    if (auth()) {
      await logoutApi({
        token: auth()?.access_token,
        success: logoutSuccessHandler,
      });
    }
  };

  /**
   * check auth token
   * @Inilization dashboardApi, orderListApi, reviewListApi, profileInfoApi
   * @param {object|array}
   * @returns {object|array}
   */

  const { data: dashboardApi, isFetching: isDashboardFetching } =
    useDashboardApiQuery(
      {
        token: auth()?.access_token,
      },
      {
        skip: !auth(),
      }
    );
  const { data: orderListApi, isFetching: isOrderListFetching } =
    useOrderListApiQuery(
      {
        token: auth()?.access_token,
      },
      {
        skip: !auth(),
      }
    );
  const { data: returnRequestsApi, isFetching: isReturnRequestsFetching } =
    useReturnRequestsApiQuery(
      {
        token: auth()?.access_token,
        ...returnRequestFilters,
      },
      {
        skip: !auth(),
      }
    );
  const { data: reviewListApi, isFetching: isReviewListFetching } =
    useReviewListApiQuery(
      {
        token: auth()?.access_token,
      },
      {
        skip: !auth(),
      }
    );
  const { data: profileInfoApi, isFetching: isProfileInfoFetching } =
    useProfileInfoApiQuery(
      {
        token: auth()?.access_token,
      },
      {
        skip: !auth(),
      }
    );

  /**
   * get user location
   * useState userLocation
   * @Inilization  getCountryListApi, getStateListApi, getCityListApi
   * @param {object|array}
   * @returns {object|array}
   */
  const [userLocation, setUserLocation] = useState({
    country: null,
    state: null,
    city: null,
  });

  // Location API queries - moved outside conditional to follow Rules of Hooks
  const { data: getCountryListData, isFetching: isGetCountryListLoading } =
    useGetCountryListApiQuery(
      {
        token: auth()?.access_token,
      },
      {
        skip: !auth(), // Only skip if not authenticated
      }
    );

  const { data: getStateListApi, isFetching: isGetStateListLoading } =
    useGetStateListApiQuery(
      {
        countryId: dashboardApi?.personInfo?.country_id || 0, // Provide fallback value
        token: auth()?.access_token,
      },
      {
        skip: !auth() || !dashboardApi?.personInfo?.country_id, // Skip if no country_id
      }
    );

  const { data: getCityListApi, isFetching: isGetCityListLoading } =
    useGetCityListApiQuery(
      {
        stateId: dashboardApi?.personInfo?.state_id || 0, // Provide fallback value
        token: auth()?.access_token,
      },
      {
        skip: !auth() || !dashboardApi?.personInfo?.state_id, // Skip if no state_id
      }
    );

  useEffect(() => {
    if (dashboardApi) {
      const country = getCountryListData?.countries.find(
        (item) => item.id === parseInt(dashboardApi?.personInfo?.country_id)
      );
      setUserLocation((prev) => ({
        ...prev,
        country: country ? country?.name : null,
      }));
      const state = getStateListApi?.states.find(
        (item) => item.id === parseInt(dashboardApi?.personInfo?.state_id)
      );
      setUserLocation((prev) => ({
        ...prev,
        state: state ? state?.name : null,
      }));
      const city = getCityListApi?.cities.find(
        (item) => item.id === parseInt(dashboardApi?.personInfo?.city_id)
      );
      setUserLocation((prev) => ({ ...prev, city: city ? city?.name : null }));
    }
  }, [dashboardApi, getCountryListData, getStateListApi, getCityListApi]);

  if (!authChecked) return (
    <div className="w-full flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="profile-page-wrapper w-full">
      <div className="container-x mx-auto">
        <div className="w-full my-10">
          {/* Breadcrumb navigation */}
          <BreadcrumbCom
            paths={[
              { name: ServeLangItem()?.home, path: "/" },
              { name: ServeLangItem()?.profile, path: "/profile" },
            ]}
          />
          <div className="w-full bg-white xl:p-10 p-5">
            <div className="title-area w-full flex justify-between items-center">
              <h2 className="text-[22px] font-bold text-qblack">
                {ServeLangItem()?.Your_Dashboard}
              </h2>
              {/* Seller dashboard switch (if applicable) */}
              {Multivendor() === 1 &&
                dashboardApi &&
                dashboardApi.is_seller && (
                  <div className="switch-dashboard flex md:flex-row md:space-x-3 flex-col space-y-3 md:space-y-0 rtl:space-x-reverse rtl:space-x-reverse items-center">
                    <p className="text-qgray text-base">
                      Satıcı Paneline Geçiş Yap
                    </p>
                    <button
                      onClick={switchDashboardHandler}
                      type="button"
                      className="w-[73px] h-[31px] border border-[#D9D9D9] rounded-full relative "
                    >
                      <div
                        className={`w-[23px] h-[23px] bg-qblack rounded-full absolute top-[3px] transition-all duration-300 ease-in-out ${
                          switchDashboard ? "left-[44px]" : "left-[4px]"
                        }`}
                      ></div>
                    </button>
                  </div>
                )}
            </div>
            <div className="profile-wrapper w-full mt-8 xl:flex xl:space-x-10 rtl:space-x-reverse">
              {/* Sidebar navigation */}
              <div className="xl:w-[236px] w-full xl:min-h-[600px] ltr:xl:border-r rtl:xl:border-l border-[rgba(0, 0, 0, 0.1)] mb-10 xl:mb-0">
                <div className="flex xl:flex-col flex-row xl:space-y-10 rtl:space-x-reverse flex-wrap gap-3 xl:gap-0">
                  {/* Sidebar tab navigation helper — replaceState kullanıyoruz, history birikmiyor */}
                  {[
                    { tab: "dashboard", icon: <IcoDashboard />, label: ServeLangItem()?.Dashboard },
                    { tab: "profile", icon: <IcoPeople />, label: ServeLangItem()?.Personal_Info },
                    { tab: "order", icon: <IcoCart />, label: ServeLangItem()?.Order },
                    { tab: "wishlist", icon: <IcoLove />, label: ServeLangItem()?.Wishlist },
                    { tab: "address", icon: <IcoAdress />, label: ServeLangItem()?.Address },
                    { tab: "review", icon: <IcoReviewHand />, label: ServeLangItem()?.Reviews },
                    { tab: "returns", icon: <IcoSupport />, label: "İade Taleplerim" },
                    { tab: "password", icon: <IcoPassword />, label: ServeLangItem()?.Change_Password },
                  ].map(({ tab, icon, label }) => (
                    <div key={tab} className="item group">
                      <button
                        type="button"
                        onClick={() => {
                          setActive(tab);
                          window.history.replaceState(null, "", `/profile#${tab}`);
                        }}
                        className="flex space-x-3 rtl:space-x-reverse items-center text-qgray hover:text-qblack capitalize"
                      >
                        <span>{icon}</span>
                        <span className={`font-normal text-base capitalize cursor-pointer${active === tab ? " text-qblack font-semibold" : ""}`}>
                          {label}
                        </span>
                      </button>
                    </div>
                  ))}
                  {/* Logout button */}
                  <div className="item group">
                    <div
                      onClick={logout}
                      className="flex space-x-3 rtl:space-x-reverse items-center text-qgray hover:text-qblack capitalize"
                    >
                      <span>
                        <IcoLogout />
                      </span>
                      <span className=" font-normal text-base capitalize cursor-pointer">
                        {ServeLangItem()?.Logout}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Main content area for each tab */}
              <div className="flex-1">
                <div className="item-body dashboard-wrapper w-full">
                  {/* Render tab content based on active state */}
                  {active === "dashboard" ? (
                    <>
                      {!isDashboardFetching && dashboardApi ? (
                        <Dashboard
                          dashBoardData={dashboardApi}
                          userLocation={userLocation}
                        />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : active === "profile" ? (
                    <>
                      {!isProfileInfoFetching && profileInfoApi ? (
                        <ProfileTab profileInfo={profileInfoApi} />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : active === "order" ? (
                    <>
                      {!isOrderListFetching && orderListApi ? (
                        <OrderTab orders={orderListApi?.orders?.data} />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : active === "wishlist" ? (
                    <WishlistTab />
                  ) : active === "address" ? (
                    <>
                      {!isGetCountryListLoading && getCountryListData ? (
                        <AddressesTab
                          countryLists={getCountryListData?.countries}
                        />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : active === "password" ? (
                    <PasswordTab />
                  ) : active === "review" ? (
                    <>
                      {!isReviewListFetching && reviewListApi ? (
                        <ReviewTab reviews={reviewListApi?.reviews?.data} />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : active === "returns" ? (
                    <>
                      {!isReturnRequestsFetching && returnRequestsApi ? (
                        <ReturnRequestsTab
                          returns={returnRequestsApi?.returns?.data}
                          stats={returnRequestsApi?.stats}
                          pagination={returnRequestsApi?.returns}
                          filters={returnRequestFilters}
                          onFiltersChange={setReturnRequestFilters}
                          isLoading={isReturnRequestsFetching}
                        />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </>
                  ) : active === "seller-tools" ? (
                    <SellerOperationsTab
                      token={auth()?.access_token}
                      isActive={active === "seller-tools"}
                      isSeller={!!dashboardApi?.is_seller}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
