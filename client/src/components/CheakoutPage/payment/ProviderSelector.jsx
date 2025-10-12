import PropTypes from "prop-types";

export default function ProviderSelector({ value, onChange, options }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Sağlayıcı</label>
      <select
        className="border rounded h-10 px-3 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

ProviderSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
};
