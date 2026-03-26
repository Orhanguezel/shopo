import sellerDetails from "@/api/sellerDetails";
import AllProductPage from "@/components/AllProductPage";
import { cache } from "react";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getSellerProductsData = cache(async (seller) => {
  return await sellerDetails(seller);
});

// generate seo metadata

export async function generateMetadata({ searchParams }) {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });
  const { seller } = searchParamsObj;
  const data = await getSellerProductsData(seller);
  const { seoSetting } = data;
  return {
    title: seoSetting?.seo_title,
    description: seoSetting?.seo_description,
  };
}

// main page
export default async function sellerProducts({ searchParams }) {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });

  //   find seller from searchParamsObj
  const { seller } = searchParamsObj;

  //   get seller details from API
  const data = await getSellerProductsData(seller);

  //  seller Basic Info
  const sellerInfo = {
    seller: data?.seller,
    review: parseInt(data?.sellerTotalReview) || 0,
  };

  return (
    <AllProductPage
      response={data}
      sellerInfo={sellerInfo ? sellerInfo : null}
    />
  );
}
