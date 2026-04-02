import { getCookie } from "cookies-next";

/**
 * Geçerli oturum = JWT (access_token) localStorage veya cookie'de olmalı.
 * Sadece user objesi kalmış, token eksik kalmış eski kayıtlar için cookie ile birleştirilir.
 */
export default function auth() {
  if (typeof window === "undefined") return false;

  const cookieToken = getCookie("access_token");
  const raw = localStorage.getItem("auth");

  if (raw && raw !== "null" && raw !== "undefined") {
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        const token = parsed.access_token || cookieToken;
        if (token) {
          return { ...parsed, access_token: token };
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (cookieToken) {
    return { access_token: cookieToken };
  }

  return false;
}
