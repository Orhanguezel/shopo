import apiRoutes from "@/appConfig/apiRoutes";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export default async function orderDetails(id) {
  // get user access token from server-side cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // fetch order details (with or without token)
  const url = accessToken
    ? `${apiRoutes.orderDetails}/${id}?token=${accessToken}`
    : `${apiRoutes.orderDetails}/${id}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  } else {
    try {
      const data = await res.json();
      return data;
    } catch (error) {
      notFound();
    }
  }
}
