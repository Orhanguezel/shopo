import { getCookie } from "cookies-next";

export default function auth() {
  if (typeof window !== "undefined") {
    // First try to get from localStorage (for backward compatibility)
    const raw = localStorage.getItem("auth");
    if (raw && raw !== "null" && raw !== "undefined") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      } catch {}
    }

    // If not in localStorage, try to get from cookie
    const accessToken = getCookie("access_token");
    if (accessToken) {
      // Return a minimal auth object with access_token
      return { access_token: accessToken };
    }

    return false;
  }
  return false;
}
