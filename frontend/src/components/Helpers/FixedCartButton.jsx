"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import ThinBag from "./icons/ThinBag";

const FixedCartButton = () => {
  const { cart } = useSelector((state) => state.cart);

  // Calculate cart items count
  const cartItemsCount = cart?.cartProducts?.length || 0;

  return (
    <div className="fixed-cart-button">
      <Link href="/cart">
        <div className="fixed-cart-wrapper">
          <div className="cart-icon">
            <ThinBag />
          </div>
          <span className="cart-count">
            {cartItemsCount > 9 ? "9+" : cartItemsCount}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default FixedCartButton;
