// src/api-manage/api-call-functions/public/publicFaq.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – FAQ
 *  - LIST : GET  /faqs?lang=
 *  - ASK  : POST /faqs/ask  { question, language? }
 */
export const publicFaqApi = api
  .enhanceEndpoints({ addTagTypes: ["FaqPublic", "FaqPublicList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Yayındaki SSS listesi
      listPublishedFaqs: build.query({
        query: (lang) => ({
          url: (R.public.faqs?.list?.() || "/faqs"),
          params: lang ? { lang } : undefined,
        }),
        transformResponse: (res) => pickData(res) ?? [],
        providesTags: (result) =>
          Array.isArray(result) && result.length
            ? [
                ...result.map((it) => ({
                  type: "FaqPublic",
                  id: it?._id || it?.id,
                })),
                { type: "FaqPublicList", id: "PUBLIC" },
              ]
            : [{ type: "FaqPublicList", id: "PUBLIC" }],
      }),

      // AI destekli soru sorma
      askFaq: build.mutation({
        query: ({ question, language } = {}) => {
          const askUrl =
            (R.public.faqs?.$?.custom && R.public.faqs.$.custom("ask")) ||
            "/faqs/ask";
          return {
            url: askUrl,
            method: "POST",
            body: { question, language },
          };
        },
        transformResponse: (res) => res?.data ?? res,
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublishedFaqsQuery,
  useAskFaqMutation,
} = publicFaqApi;
