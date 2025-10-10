// src/routes/adminRoutes.jsx
import AdminFrame from "@/features/admin/layout/AdminFrame";
import AdminDashboardPage from "@/features/admin/dashboard/AdminDashboardPage";
import AdminOrdersPage from "@/features/admin/orders/AdminOrdersPage";
import AdminProductsGrid from "@/features/admin/products/pages/AdminProductsGrid";
import AdminProductDetail from "@/features/admin/products/pages/AdminProductDetail";
import AdminProductCreate from "@/features/admin/products/pages/AdminProductCreate";
import ComingSoon from "@/features/admin/common/ComingSoon";

export const adminRoutes = [
  {
    path: "/admin",
    element: <AdminFrame />,
    children: [
      // dashboard
      { index: true, element: <AdminDashboardPage /> },
      { path: "dashboard", element: <AdminDashboardPage /> },

      // aktif modüller
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "products", element: <AdminProductsGrid /> },
      { path: "products/new", element: <AdminProductCreate /> },
      { path: "products/:id", element: <AdminProductDetail /> },

      { path: "customers", element: <ComingSoon title="Customers" /> },
      { path: "customers/:id", element: <ComingSoon title="Customer Details" /> },

      { path: "vendors", element: <ComingSoon title="Vendors" /> },
      { path: "vendors/:id", element: <ComingSoon title="Vendor Profile" /> },

      { path: "invoices", element: <ComingSoon title="Invoices" /> },
      { path: "invoice/:id", element: <ComingSoon title="Invoice Detail / Print" /> },

      { path: "history", element: <ComingSoon title="History / Activity Log" /> },
      { path: "messages", element: <ComingSoon title="Messages / Chat" /> },
      { path: "notifications", element: <ComingSoon title="Notifications" /> },

      { path: "pages", element: <ComingSoon title="Pages (CMS)" /> },
      { path: "languages", element: <ComingSoon title="Languages / i18n" /> },

      { path: "faq", element: <ComingSoon title="FAQ" /> },
      { path: "terms", element: <ComingSoon title="Terms & Conditions" /> },

      { path: "profile", element: <ComingSoon title="Profile Settings" /> },
      { path: "settings", element: <ComingSoon title="System Settings" /> },
    ],
  },
];
