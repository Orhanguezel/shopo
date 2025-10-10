import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/* -------------------------------------------------------
 * PUBLIC – Settings
 *  - GET {public.settings}
 * ----------------------------------------------------- */
export const publicSettingsApi = api
  .enhanceEndpoints({ addTagTypes: ["Setting", "SettingList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* GET SETTINGS (public list) */
      getSettings: build.query({
        query: () => ({ url: R.public.settings.list() }),
        transformResponse: (res) => (Array.isArray(res) ? res : (res?.data ?? [])),
        providesTags: (result) =>
          Array.isArray(result)
            ? [
              { type: "SettingList", id: "LIST" },
              ...result.map((s) => ({ type: "Setting", id: s.key })),
            ]
            : [{ type: "SettingList", id: "LIST" }],
      }),
    }),
    overrideExisting: true,
  });

export const { useGetSettingsQuery } = publicSettingsApi;

/* -------------------------- Helpers (FE) -------------------------- */

export function pickSetting(settings, key, defaultValue) {
  if (!Array.isArray(settings)) return defaultValue;
  const hit = settings.find((s) => s?.key === key);
  return hit?.value ?? defaultValue;
}

export const I18N_KEYS = {
  countries: "i18n.countries",
  currencies: "i18n.currencies",
  languages: "i18n.languages",
  selected: "i18n.selected",
};
