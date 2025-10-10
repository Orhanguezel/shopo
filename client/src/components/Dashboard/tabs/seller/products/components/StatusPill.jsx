import PropTypes from "prop-types";

export default function StatusPill({ status = "draft", visibility = "draft" }) {
  const label =
    status === "active" && visibility === "public"
      ? "Published"
      : status === "archived"
      ? "Archived"
      : visibility === "hidden"
      ? "Hidden"
      : "Draft";

  const cls =
    label === "Published"
      ? "text-green-600 bg-green-100"
      : label === "Archived"
      ? "text-gray-600 bg-gray-100"
      : label === "Hidden"
      ? "text-orange-600 bg-orange-100"
      : "text-yellow-700 bg-yellow-100";

  return <span className={`text-xs rounded px-2 py-1 ${cls}`}>{label}</span>;
}

StatusPill.propTypes = {
  status: PropTypes.string,
  visibility: PropTypes.string,
};
