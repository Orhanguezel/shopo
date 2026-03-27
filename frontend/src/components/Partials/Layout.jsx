import getSetupData from "@/api/setup";
import LayoutClient from "./LayoutClient";

/**
 * Server Component Layout Wrapper
 * 
 * Fetches initial website setup data on the server to improve:
 * 1. TTFB (Time to First Byte)
 * 2. LCP (Largest Contentful Paint)
 * 3. SEO (Search Engine Optimization)
 */
export default async function Layout({ children, childrenClasses }) {
  const websiteSetupData = await getSetupData();
  
  return (
    <LayoutClient 
      childrenClasses={childrenClasses} 
      websiteSetupData={websiteSetupData}
    >
      {children}
    </LayoutClient>
  );
}
