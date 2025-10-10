import PropTypes from "prop-types";

export default function Pagination({ page, pages, total, setPage }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-qgray">
        Total: <span className="font-medium text-qblack">{total || 0}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`h-[32px] px-3 border rounded ${page <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Prev
        </button>
        <span className="text-sm text-qgray">
          Page <span className="text-qblack">{page}</span> /{" "}
          <span className="text-qblack">{pages || 1}</span>
        </span>
        <button
          disabled={pages && page >= pages}
          onClick={() => setPage((p) => p + 1)}
          className={`h-[32px] px-3 border rounded ${pages && page >= pages ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pages: PropTypes.number,
  total: PropTypes.number,
  setPage: PropTypes.func.isRequired,
};
