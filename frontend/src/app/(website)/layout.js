"use client";
import "@/app/globals.css";
import Layout from "@/components/Partials/Layout";

function layout({ children }) {
  return <Layout childrenClasses="pt-0 pb-0">{children}</Layout>;
}

export default layout;
