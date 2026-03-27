import ForgotPass from "@/components/Auth/ForgotPass";

// generate seo metadata
export async function generateMetadata() {
  return {
    title: "Şifremi Unuttum | Seyfibaba",
    description: "Şifrenizi mi unuttunuz? E-posta adresinizi girerek şifrenizi sıfırlayın.",
    alternates: {
      canonical: "/forgot-password",
    },
    robots: { index: false, follow: true },
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPass />;
}
