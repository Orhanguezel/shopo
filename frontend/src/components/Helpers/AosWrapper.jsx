"use client";
import { useEffect } from "react";

function AosWrapper({ children }) {
  useEffect(() => {
    // Lazy load AOS only after page is interactive
    import("aos/dist/aos.css");
    import("aos").then((AOS) => {
      AOS.init({ once: true, disable: "mobile" });
    });
  }, []);
  return children;
}

export default AosWrapper;
