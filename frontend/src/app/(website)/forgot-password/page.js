import ForgotPass from "@/components/Auth/ForgotPass";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Forgot Password",
    description: "Forgot Password",
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPass />;
}
