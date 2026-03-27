import ProductsCompare from "@/components/ProductsCompare/index";

// generate seo metadata
export function generateMetadata() {
  return {
    title: "Product Compare | Shopo",
    description: "Compare products side by side before you buy.",
    alternates: {
      canonical: "/products-compare",
    },
  };
}

// main page
export default function ProductsComparePage() {
  return <ProductsCompare />;
}
