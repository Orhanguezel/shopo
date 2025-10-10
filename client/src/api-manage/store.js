// src/api-manage/store.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./MainApi";        // aynı klasörde → relative
import i18n from "@/i18n/state/i18nSlice"; 

export const store = configureStore({
  reducer: {
    i18n, // ← dil durumu
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [
          "api/executeQuery/fulfilled",
          "api/executeMutation/fulfilled",
        ],
        ignoredPaths: [api.reducerPath],
      },
    }).concat(api.middleware),
  devTools: import.meta.env.MODE !== "production",
});

setupListeners(store.dispatch);
