// client/api-manage/api-error-response/normalizeError.js
export const normalizeError = (err) => {
  const status = err?.status || 0;
  const data = err?.data || {};
  const message = data?.message || data?.error || (typeof err === "object" ? JSON.stringify(err) : "Unknown error");
  return { status, data, message };
};
