import FacebookCallbackClient from "./FacebookCallbackClient";

export const metadata = {
  title: "Facebook Login Callback | Shopo",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/callback/facebook",
  },
};

export default function FacebookPage() {
  return <FacebookCallbackClient />;
}
