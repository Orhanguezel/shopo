import { cache } from "react";
import appConfig from "@/appConfig";
import getProductDetails from "@/api/getProductDetails";
import SingleProductPage from "@/components/SingleProductPage";
import JsonLd, {
  generateProductSchema,
} from "@/components/Helpers/JsonLd";
import { buildProductPath, buildProductUrl } from "@/utils/url";
import { permanentRedirect } from "next/navigation";

export const revalidate = 300;

const getProductDetailsData = cache(async (slug) => getProductDetails(slug));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProductDetailsData(slug);
  const product = data?.product;
  const title = product?.seo_title || product?.name;
  const description = product?.seo_description || product?.short_description;
  const imageUrl = product?.thumb_image ? appConfig.BASE_URL + product.thumb_image : null;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Seyfibaba",
      title,
      description,
      url: buildProductUrl(appConfig.APPLICATION_URL, slug),
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: product?.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: buildProductPath(slug),
    },
  };
}

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;
  const data = await getProductDetailsData(slug);
  const canonicalSlug = data?.product?.slug;

  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(buildProductPath(canonicalSlug));
  }

  const productSchema = generateProductSchema(data);

  return (
    <>
      <JsonLd data={productSchema} />
      <SingleProductPage details={data} />
    </>
  );
}
