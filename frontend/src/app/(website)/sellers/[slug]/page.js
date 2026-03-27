import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  return {
    title: "Seller Redirect | Shopo",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/seller/${slug}`,
    },
  };
}

export default async function SellersAliasPage({ params }) {
  const { slug } = await params;
  redirect(`/seller/${slug}`);
}
