"use client";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyCardError from "../EmptyCardError";
import PageTitle from "../Helpers/PageTitle";
import ProductsTable from "./ProductsTable";
import ServeLangItem from "../Helpers/ServeLangItem";
import LoginContext from "../Contexts/LoginContext";
import auth from "../../utils/auth";
import {
  clearCartAction,
  deleteItemAction,
  updateAllItems,
} from "../../redux/features/cart/cartSlice";

function CartPage() {
  // Redux hooks
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  // React hooks
  const router = useRouter();
  const loginPopupBoard = useContext(LoginContext);
  const [cartItems, setCartItems] = useState([]);

  /**
   * Calculate total price for a cart item including variants
   * @param {Object} item - Cart item object
   * @returns {number} Total price for the item
   */
  const calculateItemTotalPrice = (item) => {
    const basePrice = item.product.offer_price || item.product.price;
    return basePrice * parseInt(item.qty);
  };

  /**
   * Update cart items with calculated total prices
   * @param {Array} items - Array of cart items
   * @returns {Array} Updated cart items with total prices
   */
  const updateCartItemsWithPrices = (items) => {
    return items.map((item) => ({
      ...item,
      totalPrice: calculateItemTotalPrice(item),
    }));
  };

  /**
   * Update cart item quantity and recalculate price
   * @param {number} productId - Product ID to update
   * @param {number} quantityChange - Change in quantity (+1 or -1)
   */
  const updateItemQuantity = (productId, quantityChange) => {
    if (!cartItems || cartItems.length === 0) return;

    const updatedCart = cartItems.map((cartItem) => {
      if (cartItem.product.id === productId) {
        const newQty = cartItem.qty + quantityChange;
        const basePrice =
          cartItem.product.offer_price || cartItem.product.price;

        return {
          ...cartItem,
          qty: newQty,
          totalPrice: basePrice * newQty,
        };
      }
      return cartItem;
    });

    dispatch(updateAllItems(updatedCart));
    setCartItems(updatedCart);
  };

  /**
   * Delete item from cart
   * @param {number} productId - Product ID to delete
   */
  const handleDeleteItem = (productId) => {
    dispatch(deleteItemAction(productId));
  };

  /**
   * Increase item quantity
   * @param {number} productId - Product ID to increase quantity
   */
  const handleIncreaseQuantity = (productId) => {
    updateItemQuantity(productId, 1);
  };

  /**
   * Decrease item quantity
   * @param {number} productId - Product ID to decrease quantity
   */
  const handleDecreaseQuantity = (productId) => {
    updateItemQuantity(productId, -1);
  };

  /**
   * Clear all items from cart
   */
  const handleClearCart = () => {
    dispatch(clearCartAction());
  };

  /**
   * Navigate to checkout or show login popup
   */
  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Update cart items when cart state changes
  useEffect(() => {
    if (cart?.cartProducts?.length > 0) {
      const itemsWithPrices = updateCartItemsWithPrices(cart.cartProducts);
      setCartItems(itemsWithPrices);
    } else {
      setCartItems([]);
    }
  }, [cart]);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { name: ServeLangItem()?.home, path: "/" },
    { name: ServeLangItem()?.cart, path: "/cart" },
  ];

  // Render empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page-wrapper w-full pt-[30px] pb-[60px]">
        <div className="container-x mx-auto">
          <BreadcrumbCom paths={breadcrumbItems} />
          <EmptyCardError />
        </div>
      </div>
    );
  }

  // Render cart with items
  return (
    <div className="cart-page-wrapper w-full bg-white pb-[60px]">
      {/* Page header */}
      <div className="w-full">
        <PageTitle title="Your Cart" breadcrumb={breadcrumbItems} />
      </div>

      {/* Cart content */}
      <div className="w-full mt-[23px]">
        <div className="container-x mx-auto">
          {/* Products table */}
          <ProductsTable
            incrementQty={handleIncreaseQuantity}
            decrementQty={handleDecreaseQuantity}
            deleteItem={handleDeleteItem}
            cartItems={cartItems}
            className="mb-[30px]"
          />

          {/* Action buttons */}
          <div className="w-full sm:flex justify-between">
            <div className="flex space-x-4 rtl:space-x-reverse items-center">
              {/* Clear cart button */}
              <button onClick={handleClearCart} type="button">
                <div className="w-full text-sm font-semibold text-qred mb-5 sm:mb-0">
                  {ServeLangItem()?.Clear_Cart}
                </div>
              </button>

              {/* Update cart button */}
              <Link href="/cart">
                <div className="w-[140px] h-[50px] bg-[#F6F6F6] flex justify-center items-center cursor-pointer">
                  <span className="text-sm font-semibold">
                    {ServeLangItem()?.Update_Cart}
                  </span>
                </div>
              </Link>

              {/* Checkout button */}
              <button onClick={handleCheckout}>
                <div className="w-[300px] h-[50px] black-btn flex justify-center items-center cursor-pointer">
                  <span className="text-sm font-semibold">
                    {ServeLangItem()?.Proceed_to_Checkout}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
