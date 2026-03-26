import TrackingOrder from "@/components/TrackingOrder/index";

export const dynamic = 'force-dynamic'; // Static export için gerekli

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Tracking Order",
    description: "Tracking Order",
  };
}

// main page
export default async function trackingOrderPage() {
  return <TrackingOrder />;
}
