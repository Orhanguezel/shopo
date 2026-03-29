import apiRoutes from "@/appConfig/apiRoutes";
import { notFound } from "next/navigation";

const PUBLIC_CONTENT_REVALIDATE = 300;

export default async function about() {
  const res = await fetch(`${apiRoutes.about}`, {
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: PUBLIC_CONTENT_REVALIDATE,
    },
  });
  if (!res.ok) {
    notFound();
  }
  try {
    const data = await res.json();
    return data;
  } catch (error) {
    notFound();
  }
}
