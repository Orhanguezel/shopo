import apiRoutes from "@/appConfig/apiRoutes";
import { notFound } from "next/navigation";

const PUBLIC_CONTENT_REVALIDATE = 300;

export default async function home() {
  const apiUrl = `${apiRoutes.shopo}`;

  try {
    const res = await fetch(apiUrl, {
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
      return await res.json();
    } catch {
      notFound();
    }
  } catch {
    notFound();
  }
}
