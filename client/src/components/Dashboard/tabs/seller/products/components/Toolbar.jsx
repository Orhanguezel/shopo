import PropTypes from "prop-types";

export default function Toolbar({ q, setQ, status, setStatus, onFilter, onAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          className="border rounded px-3 py-2 w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All</option>
          <option value="active">Active / Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="hidden">Hidden</option>
        </select>
        <button
          onClick={onFilter}
          className="h-[38px] px-4 bg-qyellow text-qblack font-semibold rounded"
        >
          Filter
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="h-[38px] px-4 bg-qblack text-white rounded"
        >
          + Add Product
        </button>
      </div>
    </div>
  );
}

Toolbar.propTypes = {
  q: PropTypes.string.isRequired,
  setQ: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  setStatus: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};
