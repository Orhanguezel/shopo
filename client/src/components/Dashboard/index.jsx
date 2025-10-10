// src/components/Profile/index.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // ⬅️ eklendi

import BreadcrumbCom from "@/components/BreadcrumbCom";
import Layout from "@/components/Partials/Layout";

import IcoAdress from "./icons/IcoAdress";
import IcoCart from "./icons/IcoCart";
import IcoDashboard from "./icons/IcoDashboard";
import IcoLogout from "./icons/IcoLogout";
import IcoPassword from "./icons/IcoPassword";
import IcoPayment from "./icons/IcoPayment";
import IcoPeople from "./icons/IcoPeople";
import IcoSupport from "./icons/IcoSupport";

/* Tabs (mevcut) */
import AddressesTab from "./tabs/AddressesTab";
import Dashboard from "./tabs/Dashboard";
import OrderTab from "./tabs/OrderTab";
import PasswordTab from "./tabs/PasswordTab";
import Payment from "./tabs/Payment";
import ProfileTab from "./tabs/ProfileTab";
import SupportTab from "./tabs/SupportTab";
import SellerProductsTab from "./tabs/seller/products";

/* API: oturum ve çıkış */
import {
  useMeQuery,
  useLogoutMutation,
} from "@/api-manage/api-call-functions/public/publicAuth.api";

/** ---- Basit placeholder’lar (Seller/Admin) ---- **/
const PlaceholderBox = ({ title, desc }) => (
  <div className="bg-white rounded border border-gray-200 p-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-qgraytwo">{desc}</p>
  </div>
);

// ⬇️ prop-types doğrulaması
PlaceholderBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  desc: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

PlaceholderBox.defaultProps = {
  title: "—",
  desc: "",
};

// SELLER sekmeleri

const SellerOrdersTab = () => (
  <PlaceholderBox title="Shop Orders" desc="Mağaza siparişleri, durum güncelleme, iade/iptal işlemleri." />
);
const SellerReviewsTab = () => (
  <PlaceholderBox title="Product Reviews" desc="Ürün yorumları ve yanıtlar, moderasyon." />
);
const SellerShopSettingsTab = () => (
  <PlaceholderBox title="Shop Settings" desc="Mağaza bilgileri, logo/kapak, kargo & politika ayarları." />
);
const SellerFinanceTab = () => (
  <PlaceholderBox title="Finance / Payouts" desc="Ödemeler, bakiyeler, fatura/IBAN ve ödeme tarihleri." />
);

// ADMIN sekmeleri
const AdminOverviewTab = () => (
  <PlaceholderBox title="Admin Overview" desc="Toplam kullanıcı, satıcı, sipariş, ciro, dönüşüm metrikleri." />
);
const AdminUsersTab = () => (
  <PlaceholderBox title="Users" desc="Kullanıcı yönetimi: liste, filtre, durum, roller." />
);
const AdminSellersTab = () => (
  <PlaceholderBox title="Sellers" desc="Satıcı yönetimi: onboard, doğrulama, mağaza durumu." />
);
const AdminProductsTab = () => (
  <PlaceholderBox title="Products" desc="Katalog yönetimi, kategoriler, özellikler, fiyat/indirim." />
);
const AdminOrdersTab = () => (
  <PlaceholderBox title="Orders" desc="Tüm siparişler, SLA, iade/iptal, uyuşmazlıklar." />
);
const AdminReviewsTab = () => (
  <PlaceholderBox title="Reviews" desc="Yorum/puan moderasyonu ve raporlama." />
);
const AdminReportsTab = () => (
  <PlaceholderBox title="Reports & Analytics" desc="Satış, trafik, ürün/mağaza performansı raporları." />
);
const AdminSettingsTab = () => (
  <PlaceholderBox title="Platform Settings" desc="Ödeme/Kargo sağlayıcıları, vergi, çoklu tenant ayarları." />
);
const AdminPermissionsTab = () => (
  <PlaceholderBox title="Roles & Permissions" desc="Rol tabanlı yetkiler, izin matrisi, politika yönetimi." />
);

export default function Profile() {
  const [switchDashboard, setSwitchDashboard] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // me & logout
  const { data: me, isLoading: meLoading } = useMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // kimlik/rol
  const uid = me?._id || me?.id;
  const roles = useMemo(
    () => (Array.isArray(me?.roles) ? me.roles : (me?.role ? [me.role] : [])),
    [me]
  );
  const isAdmin = roles.includes("admin");
  const isSeller = roles.includes("seller");
  const isLoggedIn = !!uid;
  const isGuest = !isLoggedIn;

  // guest → login’e yönlendir
  useEffect(() => {
    if (!meLoading && isGuest) {
      navigate("/login?redirect=/profile", { replace: true });
    }
  }, [meLoading, isGuest, navigate]);

  // Menü & tab’lar: role-based
  const baseUserTabs = [
    { key: "dashboard", label: "Dashboard", icon: <IcoDashboard /> },
    { key: "profile", label: "Personal Info", icon: <IcoPeople /> },
    { key: "payment", label: "Payment Method", icon: <IcoPayment /> },
    { key: "order", label: "Orders", icon: <IcoCart /> },
    { key: "address", label: "Address", icon: <IcoAdress /> },
    { key: "password", label: "Change Password", icon: <IcoPassword /> },
    { key: "support", label: "Support Ticket", icon: <IcoSupport /> },
  ];

  const sellerTabs = [
    { key: "seller-products", label: "Products", icon: <IcoCart /> },
    { key: "seller-orders", label: "Shop Orders", icon: <IcoCart /> },
    { key: "seller-reviews", label: "Product Reviews", icon: <IcoSupport /> },
    { key: "seller-shop", label: "Shop Settings", icon: <IcoPeople /> },
    { key: "seller-finance", label: "Finance / Payouts", icon: <IcoPayment /> },
  ];

  const adminTabs = [
    { key: "admin-overview", label: "Admin Overview", icon: <IcoDashboard /> },
    { key: "admin-users", label: "Users", icon: <IcoPeople /> },
    { key: "admin-sellers", label: "Sellers", icon: <IcoPeople /> },
    { key: "admin-products", label: "Products", icon: <IcoCart /> },
    { key: "admin-orders", label: "Orders", icon: <IcoCart /> },
    { key: "admin-reviews", label: "Reviews", icon: <IcoSupport /> },
    { key: "admin-reports", label: "Reports", icon: <IcoDashboard /> },
    { key: "admin-settings", label: "Settings", icon: <IcoPayment /> },
    { key: "admin-permissions", label: "Roles & Permissions", icon: <IcoPassword /> },
  ];

  const allowedTabs = useMemo(() => {
    if (!isLoggedIn) return [];
    const all = [...baseUserTabs];
    if (isSeller) all.unshift(...sellerTabs);
    if (isAdmin) all.unshift(...adminTabs);
    return all.map((x) => x.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isSeller, isAdmin]);

  // Aktif sekme (hash)
  const [active, setActive] = useState("dashboard");
  useEffect(() => {
    const h = (location.hash || "").replace("#", "") || "dashboard";
    setActive(allowedTabs.includes(h) ? h : "dashboard");
  }, [location.hash, allowedTabs]);

  const onLogout = async (e) => {
    e.preventDefault();
    try {
      await logout().unwrap();
      navigate("/login?redirect=/profile", { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Logout failed:", err);
    }
  };

  // İçerik çözücü
  const renderTab = (key) => {
    switch (key) {
      // base
      case "dashboard": return <Dashboard me={me} />;
      case "profile": return <ProfileTab />;
      case "payment": return <Payment />;
      case "order": return <OrderTab />;
      case "address": return <AddressesTab />;
      case "password": return <PasswordTab />;
      case "support": return <SupportTab />;

      // seller
      case "seller-products": return <SellerProductsTab />;
      case "seller-orders": return <SellerOrdersTab />;
      case "seller-reviews": return <SellerReviewsTab />;
      case "seller-shop": return <SellerShopSettingsTab />;
      case "seller-finance": return <SellerFinanceTab />;

      // admin
      case "admin-overview": return <AdminOverviewTab />;
      case "admin-users": return <AdminUsersTab />;
      case "admin-sellers": return <AdminSellersTab />;
      case "admin-products": return <AdminProductsTab />;
      case "admin-orders": return <AdminOrdersTab />;
      case "admin-reviews": return <AdminReviewsTab />;
      case "admin-reports": return <AdminReportsTab />;
      case "admin-settings": return <AdminSettingsTab />;
      case "admin-permissions": return <AdminPermissionsTab />;

      default: return <Dashboard me={me} />;
    }
  };

  if (!isLoggedIn && meLoading) {
    return (
      <Layout>
        <div className="container-x mx-auto py-16 text-center text-qgray">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="profile-page-wrapper w-full">
        <div className="container-x mx-auto">
          <div className="w-full my-10">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "profile", path: "/profile" },
              ]}
            />
            <div className="w-full bg-white px-10 py-9">
              <div className="title-area w-full flex justify-between items-center">
                <h1 className="text-[22px] font-bold text-qblack">
                  {isAdmin ? "Admin Dashboard"
                    : isSeller ? "Seller Dashboard"
                    : "Your Dashboard"}
                </h1>
                <div className="switch-dashboard flex space-x-3 items-center">
                  <p className="text-qgray text-base">Switch Dashboard</p>
                  <button
                    onClick={() => setSwitchDashboard(!switchDashboard)}
                    type="button"
                    className="w-[73px] h-[31px] border border-[#D9D9D9] rounded-full relative "
                  >
                    <div
                      className={`w-[23px] h-[23px] bg-qblack rounded-full absolute top-[3px] transition-all duration-300 ease-in-out ${
                        switchDashboard ? "left-[44px]" : "left-[4px]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="profile-wrapper w-full mt-8 flex space-x-10">
                {/* Sidebar */}
                <div className="w-[236px] min-h-[600px] border-r border-[rgba(0, 0, 0, 0.1)] pr-4">
                  <div className="flex flex-col space-y-6">
                    {/* Genel (Dashboard) */}
                    <div className="item group">
                      <Link to="/profile#dashboard">
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span><IcoDashboard /></span>
                          <span className="font-normal text-base">Dashboard</span>
                        </div>
                      </Link>
                    </div>

                    {/* Admin blok */}
                    {isAdmin && (
                      <>
                        <div className="text-[11px] uppercase tracking-wider text-qgray mt-2">Admin</div>
                        {adminTabs.map((t) => (
                          <div className="item group" key={t.key}>
                            <Link to={`/profile#${t.key}`}>
                              <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                                <span>{t.icon}</span>
                                <span className="font-normal text-base">{t.label}</span>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Seller blok */}
                    {isSeller && (
                      <>
                        <div className="text-[11px] uppercase tracking-wider text-qgray mt-2">Seller</div>
                        {sellerTabs.map((t) => (
                          <div className="item group" key={t.key}>
                            <Link to={`/profile#${t.key}`}>
                              <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                                <span>{t.icon}</span>
                                <span className="font-normal text-base">{t.label}</span>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Account / User blok */}
                    <div className="text-[11px] uppercase tracking-wider text-qgray mt-2">Account</div>
                    {baseUserTabs.map((t) => (
                      <div className="item group" key={t.key}>
                        <Link to={`/profile#${t.key}`}>
                          <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                            <span>{t.icon}</span>
                            <span className="font-normal text-base">{t.label}</span>
                          </div>
                        </Link>
                      </div>
                    ))}

                    {/* Logout */}
                    <div className="item group">
                      <Link to="/profile#profile" onClick={onLogout}>
                        <div className="flex space-x-3 items-center text-qgray hover:text-qblack">
                          <span><IcoLogout /></span>
                          <span className="font-normal text-base">
                            {isLoggingOut ? "Logging out..." : "Logout"}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="item-body dashboard-wrapper w-full">
                    {renderTab(active)}
                  </div>
                </div>
              </div>

              {!isLoggedIn && !meLoading && (
                <div className="mt-6 text-qgraytwo text-sm">
                  You need to log in to view this page.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
