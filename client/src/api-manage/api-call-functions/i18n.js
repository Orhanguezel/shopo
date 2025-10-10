// client/api-manage/api-call-functions/public/i18n.js
import { api } from "@/api-manage/MainApi";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – I18N translations (DB key→value)
 *  GET /i18n/:lang?ns=a,b
 */
export const publicI18nApi = api
  .enhanceEndpoints({ addTagTypes: ["I18N"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getTranslations: build.query({
        // args: { lang, ns?: string | string[] }
        query: ({ lang, ns } = {}) => {
          const params = ns
            ? { ns: Array.isArray(ns) ? ns.join(",") : String(ns) }
            : undefined;
          // Registry’de i18n yoksa direkt path kullan (sen ekleyebilirsin):
          return { url: `/i18n/${lang}`, params };
        },
        transformResponse: (res) => pickData(res) || res || {},
        providesTags: (_r, _e, { lang }) => [{ type: "I18N", id: lang || "current" }],
      }),
    }),
    overrideExisting: true,
  });

export const { useGetTranslationsQuery } = publicI18nApi;
