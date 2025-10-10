import { useCallback } from "react";
import { load } from "recaptcha-v3";

export const useRecaptcha = () => {
  const executeRecaptcha = useCallback(async (action) => {
    try {
      // Vite.js env variable
      const siteKey = import.meta.env.VITE_API_RECAPTCHA_SITE_KEY;
      if (!siteKey) {
        console.error("reCAPTCHA site key is missing.");
        return null;
      }
      const recaptcha = await load(siteKey);
      const token = await recaptcha.execute(action);
      return token;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      return null;
    }
  }, []);

  return executeRecaptcha;
};
