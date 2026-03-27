import getProductDetails from "@/api/getProductDetails";
import SingleProductPage from "@/components/SingleProductPage";
import { cache } from "react";
import appConfig from "@/appConfig";
import JsonLd, { generateProductSchema, generateBreadcrumbSchema } from "@/components/Helpers/JsonLd";

export const dynamic = 'force-dynamic'; // Static export için gerekli

export const getProductDetailsData = cache(async (slug) => {
  return await getProductDetails(slug);
});

// generate seo metadata
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const slug = params.slug;
  const data = await getProductDetailsData(slug);
  const product = data?.product;
  
  const title = product?.seo_title || product?.name;
  const description = product?.seo_description || product?.short_description;
  const imageUrl = product?.thumb_image ? appConfig.BASE_URL + product.thumb_image : null;

  return {
    title: title,
    description: description,
    openGraph: {
      type: "website",
      siteName: "Seyfibaba",
      title: title,
      description: description,
      url: `${appConfig.APPLICATION_URL}/single-product?slug=${slug}`,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product?.name,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `/single-product?slug=${slug}`,
    },
  };
}

// main page
export default async function SingleProduct({ searchParams }) {
  const params = await searchParams;
  const slug = params.slug;
  const data = await getProductDetailsData(slug);
  const productSchema = generateProductSchema(data);
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Anasayfa", item: "/" },
    { name: data?.product?.category?.name, item: `/products?category=${data?.product?.category?.slug}` },
    { name: data?.product?.name }
  ]);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <SingleProductPage details={data} />
    </>
  );
}
