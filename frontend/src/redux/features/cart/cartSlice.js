import { createSlice } from "@reduxjs/toolkit";

// string
const CART = "cart";

// Initial state
const initialState = {
  cart: {
    cartProducts: [],
  },
  status: null,
};

// Create slice with builder callback
export const cartSlice = createSlice({
  name: CART,
  initialState,
  reducers: {
    addItem: (state, { payload }) => {
      const newItem = [...state.cart.cartProducts, payload];
      state.cart.cartProducts = newItem;
    },
    deleteItemAction: (state, { payload }) => {
      const newItem = state.cart.cartProducts.filter(
        (item) => Number(item.product_id) !== Number(payload)
      );
      state.cart.cartProducts = newItem;
    },
    clearCartAction: (state) => {
      state.cart.cartProducts = [];
    },
    updateAllItems: (state, { payload }) => {
      state.cart.cartProducts = payload;
    },
  },
});

export const { addItem, clearCartAction, deleteItemAction, updateAllItems } =
  cartSlice.actions;

export default cartSlice.reducer;
