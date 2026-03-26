import BecomeSaller from "@/components/BecomeSaller";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Become seller",
    description: "Become seller",
  };
}
// main page
export default function BecomeSallerPage() {
  return <BecomeSaller />;
}
