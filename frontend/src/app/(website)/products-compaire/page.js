import ProductsCompaire from "@/components/ProductsCompaire/index";

// generate seo metadata
export function generateMetadata() {
  return {
    title: "Product Compaire",
    description: "Product Compaire",
  };
}

// main page
export default function productsCompairePage() {
  return <ProductsCompaire />;
}
