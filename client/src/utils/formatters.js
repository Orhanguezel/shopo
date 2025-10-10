// basit format yardımcıları
export const fmtPrice = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
  } catch {
    return String(v);
  }
};

export const fmtDate = (s) => (s ? new Date(s).toLocaleString() : "-");
