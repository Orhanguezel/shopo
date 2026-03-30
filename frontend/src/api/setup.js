import apiRoutes from "@/appConfig/apiRoutes";

const DEFAULT_LANGUAGE_CODE = "tr";

export default async function getSetupData() {
  const apiUrl = `${apiRoutes.websiteSetup}?lang_code=${DEFAULT_LANGUAGE_CODE}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}
