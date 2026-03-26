import languageModel from "./../../utils/languageModel";

function ServeLangItem() {
  const langCntnt = languageModel();
  // Ensure we always return an object with default values for SSR compatibility
  return langCntnt && typeof langCntnt === "object"
      ? langCntnt
      : {
          home: "Home",
          Show_more: "Show more",
        };
}

export default ServeLangItem;
