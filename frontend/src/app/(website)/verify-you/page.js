import Signup from "@/components/Auth/Signup/index";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Verify You",
    description: "Verify You",
  };
}

// main page
export default function verifyYou() {
  return <Signup />;
}
