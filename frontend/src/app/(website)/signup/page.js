import Signup from "@/components/Auth/Signup/index";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Signup",
    description: "Signup",
  };
}
// main page
export default function signupPage() {
  return <Signup />;
}
