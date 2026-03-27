import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const searchParamsObj = await searchParams;
  const seller = searchParamsObj?.seller;

  return {
    title: "Seller Products Redirect | Shopo",
    robots: { index: false, follow: false },
    alternates: {
      canonical: seller ? `/seller/${seller}` : "/sellers",
    },
  };
}

export default async function SellerProductsRedirect({ searchParams }) {
  const searchParamsObj = await searchParams;
  const { seller, ...rest } = searchParamsObj;

  if (!seller) {
    redirect("/sellers");
  }

  const params = new URLSearchParams();
  Object.entries(rest || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  redirect(`/seller/${seller}${queryString ? `?${queryString}` : ""}`);
}
