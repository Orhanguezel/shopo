//client/src/features/MeHydrator.jsx
import { useEffect } from "react";
import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";

export default function MeHydrator() {
  const { data, isFetching } = useMeQuery();
  useEffect(() => {
    // sadece tetikleme/ısınma; UI yok
  }, [data, isFetching]);
  return null;
}
