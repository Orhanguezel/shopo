// shopo/client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import { store } from "@/api-manage/store";
import App from "./App";
import "./index.css";
import "aos/dist/aos.css";
import "react-range-slider-input/dist/style.css";
import { I18nProvider } from "@/i18n/I18nProvider";

if (import.meta.env.MODE === "production") {
  registerSW();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </Provider>
  </React.StrictMode>
);
