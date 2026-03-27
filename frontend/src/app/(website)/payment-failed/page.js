import React from "react";
import PaymentFailed from "../../../components/PaymentFailed";

export const metadata = {
  title: "Payment Failed | Shopo",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/payment-failed",
  },
};

function PaymentFailedPage() {
  return <PaymentFailed />;
}

export default PaymentFailedPage;
