import orderDetails from "@/api/orderDetails";
import OrderCom from "@/components/OrderCom";

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: `Order #${id} | Shopo`,
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/order/${id}`,
    },
  };
}

// Static export için gerekli
export async function generateStaticParams() {
  // Dinamik route olduğu için boş array döndürüyoruz
  // Sayfa runtime'da render edilecek
  return [];
}

export const dynamic = 'force-dynamic'; // Runtime'da render et

export default async function OrderDetailsPage({ params }) {
  // get order id from here
  const { id } = await params;

  // get order details from here
  const data = await orderDetails(id);

  // get order status from here
  const getOrderStatus = () => {
    switch (Number(data?.order?.order_status)) {
      case 0:
        return "Pending";
      case 1:
        return "Progress";
      case 2:
        return "Delivered";
      case 3:
        return "Completed";
      case 4:
        return "Declined";
      default:
        return "Pending";
    }
  };
  const orderStatus = getOrderStatus();

  // return order details component
  return (
    <OrderCom resData={data?.order} orderStatus={orderStatus} orderId={id} />
  );
}
