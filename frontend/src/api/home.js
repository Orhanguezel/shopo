import apiRoutes from "@/appConfig/apiRoutes";
import { notFound } from "next/navigation";

const PUBLIC_CONTENT_REVALIDATE = 300;

export default async function home() {
  // Debug: API URL'ini logla (production'da console.log çalışmaz ama hata mesajında görünebilir)
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
      console.error(`API Error: ${res.status} ${res.statusText} - URL: ${apiUrl}`);
      notFound();
    }
    
    try {
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`JSON Parse Error: ${error.message} - URL: ${apiUrl}`);
      notFound();
    }
  } catch (error) {
    console.error(`Fetch Error: ${error.message} - URL: ${apiUrl}`);
    notFound();
  }
}
