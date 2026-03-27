import BecomeSaller from "@/components/BecomeSaller";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Satıcı Ol | Seyfibaba",
    description: "Seyfibaba pazaryerinde satıcı olun. Ürünlerinizi binlerce müşteriye ulaştırın.",
    alternates: {
      canonical: "/become-seller",
    },
  };
}
// main page
export default function BecomeSallerPage() {
  return <BecomeSaller />;
}
