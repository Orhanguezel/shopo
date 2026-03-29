import SellerProfile from "@/components/Sellers/SellerProfile";
import sellerDetails from "@/api/sellerDetails";
import JsonLd, { generateSellerSchema } from "@/components/Helpers/JsonLd";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const data = await sellerDetails(slug);
    return {
      title: `${data.seller?.shop_name || "Satıcı"} | Seyfibaba Pazaryeri`,
      description:
        data.seller?.seo_description ||
        `${data.seller?.shop_name || "Satıcı"} mağazasını Seyfibaba'da ziyaret edin.`,
      openGraph: {
        title: data.seller?.shop_name || "Satıcı Mağazası",
        images: data.seller?.logo ? [data.seller.logo] : [],
      },
      alternates: {
        canonical: `/seller/${slug}`,
      },
    };
  } catch (error) {
    if (error?.digest === 'NEXT_NOT_FOUND' || error?.message?.includes('NEXT_NOT_FOUND') || error?.message === 'NEXT_NOT_FOUND') {
      throw error;
    }
    return {
      title: "Satıcı Mağazası | Seyfibaba Pazaryeri",
      alternates: {
        canonical: `/seller/${slug}`,
      },
    };
  }
}

export default async function SellerPage({ params }) {
  const { slug } = await params;

  let sellerSchema = null;

  try {
    const data = await sellerDetails(slug);
    if (data?.seller) {
      sellerSchema = generateSellerSchema(data.seller);
    }
  } catch (error) {
    // Fail silently — schemas are non-critical
    if (error?.digest === 'NEXT_NOT_FOUND' || error?.message?.includes('NEXT_NOT_FOUND') || error?.message === 'NEXT_NOT_FOUND') {
      throw error;
    }
  }

  return (
    <>
      {sellerSchema && <JsonLd data={sellerSchema} />}
      <SellerProfile slug={slug} />
    </>
  );
}
