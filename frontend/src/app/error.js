"use client";
import ApplicationErrorTemp from "@/components/ApplicationErrorTemp";
import { useEffect } from "react";

export default function Error({ error }) {
  useEffect(() => {
    if (error?.message) {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error.message, stack: error.stack?.slice(0, 2000) }),
      }).catch(() => {});
    }
  }, [error]);
  return <ApplicationErrorTemp />;
}
