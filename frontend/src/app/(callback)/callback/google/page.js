import GoogleCallbackClient from "./GoogleCallbackClient";

export const metadata = {
  title: "Google Login Callback | Shopo",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/callback/google",
  },
};

export default function GooglePage() {
  return <GoogleCallbackClient />;
}
