"use client";
import { useEffect } from "react";
// aos
import AOS from "aos";
import "aos/dist/aos.css";

function AosWrapper({ children }) {
  // aos
  useEffect(() => {
    AOS.init({ once: true, disable: "mobile" });
  }, []);
  return children;
}

export default AosWrapper;
