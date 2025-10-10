import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/** Gelen company objesini tek tipe normalize et */
const normalizeCompany = (raw) => {
  const c = raw || {};
  const social = c.social || c.socialLinks || {};
  const lang = c.language || "en";
  return {
    ...c,
    /** i18n kısa alanlar */
    name:
      (c.companyName && (c.companyName[lang] || c.companyName.en)) ||
      c.companyName ||
      c.name,
    description:
      (c.companyDesc && (c.companyDesc[lang] || c.companyDesc.en)) ||
      c.companyDesc ||
      c.description,
    /** sosyal linkleri tek isimde topla */
    social: {
      facebook: social.facebook || null,
      instagram: social.instagram || null,
      x: social.x || social.twitter || null,
      linkedin: social.linkedin || null,
      youtube: social.youtube || null,
    },
  };
};

/* -------------------------------------------------------
 * PUBLIC – Company (tekil kayıt)
 *  GET {public.company}
 * ----------------------------------------------------- */
export const publicCompanyApi = api
  .enhanceEndpoints({ addTagTypes: ["Company"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getCompanyInfo: build.query({
        query: () => ({
          url: (R.public.company?.list?.() || "/api/company"),
        }),
        transformResponse: (res) => normalizeCompany(pickData(res)),
        providesTags: (result) =>
          result && (result._id || result.id)
            ? [{ type: "Company", id: result._id || result.id }]
            : [{ type: "Company", id: "SINGLE" }],
      }),
    }),
    overrideExisting: true,
  });

export const { useGetCompanyInfoQuery } = publicCompanyApi;
