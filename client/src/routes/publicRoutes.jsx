import Home from "@/components/Home";
import HomeTwo from "@/components/HomeTwo";
import HomeThree from "@/components/HomeThree";
import HomeFour from "@/components/HomeFour";
import HomeFive from "@/components/HomeFive";
import AllProductPage from "@/components/AllProductPage";
import SingleProductPage from "@/components/SingleProductPage";
import CardPage from "@/components/CartPage";
import CheakoutPage from "@/components/CheakoutPage";
import Wishlist from "@/components/Wishlist";
import FlashSale from "@/components/FlashSale";
import SallerPage from "@/components/SallerPage";
import ProductsCompaire from "@/components/ProductsCompaire";
import Sallers from "@/components/Sellers/SellersPage";
import About from "@/components/About";
import Blogs from "@/components/Blogs";
import Blog from "@/components/Blogs/Blog.jsx"; // Blog detail (slug ile)
import TrackingOrder from "@/components/TrackingOrder";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Login from "@/components/Auth/Login";
import Signup from "@/components/Auth/Signup";
import Profile from "@/components/Dashboard";
import BecomeSaller from "@/components/BecomeSaller";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TermsCondition from "@/components/TermsCondition";
import FourZeroFour from "@/components/FourZeroFour";

export const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/home-two", element: <HomeTwo /> },
  { path: "/home-three", element: <HomeThree /> },
  { path: "/home-four", element: <HomeFour /> },
  { path: "/home-five", element: <HomeFive /> },

  { path: "/all-products", element: <AllProductPage /> },

  // ✅ slug’lı ürün detayı
  { path: "/product/:slug", element: <SingleProductPage /> },

  // (opsiyonel) eski rota—geri uyumluluk için dursun
  { path: "/single-product", element: <SingleProductPage /> },

  { path: "/cart", element: <CardPage /> },
  { path: "/checkout", element: <CheakoutPage /> },
  { path: "/wishlist", element: <Wishlist /> },
  { path: "/flash-sale", element: <FlashSale /> },
  { path: "/saller-page", element: <SallerPage /> },
  { path: "/products-compaire", element: <ProductsCompaire /> },
  { path: "/sallers", element: <Sallers /> },
  { path: "/about", element: <About /> },

  // ✅ Blog listesi
  { path: "/blogs", element: <Blogs /> },

  // ✅ Blog detayı — slug ile
  { path: "/blogs/:slug", element: <Blog /> },

  // (opsiyonel) eski sabit rota — kaldırılabilir
  // { path: "/blogs/blog", element: <FourZeroFour /> }, // veya <Navigate to="/blogs" replace />

  { path: "/tracking-order", element: <TrackingOrder /> },
  { path: "/contact", element: <Contact /> },
  { path: "/faq", element: <Faq /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/profile", element: <Profile /> },
  { path: "/become-saller", element: <BecomeSaller /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-condition", element: <TermsCondition /> },

  { path: "*", element: <FourZeroFour /> },
];
