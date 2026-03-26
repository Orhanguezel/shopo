import { getCookie } from "cookies-next";

export default function auth() {
  if (typeof window !== "undefined") {
    // First try to get from localStorage (for backward compatibility)
    if (localStorage.getItem("auth")) {
      return JSON.parse(localStorage.getItem("auth"));
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
