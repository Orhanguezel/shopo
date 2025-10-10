// src/api-manage/hooks/custom-hooks/useScrollRestoration.js
import { useEffect } from "react";
import Router from "next/router";

export default function useScrollRestoration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { history } = window;
    if ("scrollRestoration" in history) {
      const prev = history.scrollRestoration;
      history.scrollRestoration = "manual";

      let shouldRestore = true;
      const onStart = () => { shouldRestore = false; };
      const onComplete = () => {
        if (shouldRestore) window.scrollTo(0, 0);
        shouldRestore = true;
      };

      Router.events.on("routeChangeStart", onStart);
      Router.events.on("routeChangeComplete", onComplete);

      return () => {
        Router.events.off("routeChangeStart", onStart);
        Router.events.off("routeChangeComplete", onComplete);
        history.scrollRestoration = prev;
      };
    }
  }, []);
}
