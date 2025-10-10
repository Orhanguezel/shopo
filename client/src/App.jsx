// shopo/client/src/App.jsx
import { useEffect } from "react";
import AOS from "aos";
import Routers from "./Routers";
import { ThemeProvider } from "styled-components";
import { adminTheme } from "@/theme/adminTheme";
import MeHydrator from "@/api-manage/MeHydrator";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  useEffect(() => {
    AOS.init({ once: true, duration: 400 });
  }, []);

  return (
    <ThemeProvider theme={adminTheme}>
      <MeHydrator />
      <Routers />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={adminTheme.mode}
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333",
          textAlign: "center",
                }}
        className="custom-toast"
      />
    </ThemeProvider>
  );
}
