import PropTypes from "prop-types";
import StatusPill from "./StatusPill";
import { fmtPrice, fmtDate } from "@/utils/formatters";

function ProductRow({ row, onEdit, onTogglePublish, onDelete }) {
  // const id = row._id || row.id; // ❌ kullanılmıyor, sil
  const img =
    row.images?.[0]?.thumbnail ||
    row.images?.[0]?.url ||
    row.image ||
    "/assets/images/product-img-1.jpg";
  const title = row.title?.en || row.title?.tr || row.slugCanonical || "(untitled)";
  const isPublished = row.status === "active" && row.visibility === "public";

  return (
    <tr className="bg-white border-t hover:bg-gray-50">
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <img src={img} alt="" className="w-12 h-12 rounded object-cover border" />
          <div className="flex flex-col">
            <div className="font-medium text-qblack">{title}</div>
            <div className="text-xs text-qgray">{row.slugCanonical || ""}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        <div className="flex flex-col items-center">
          <span className="text-qblack font-medium">{fmtPrice(row.salePrice ?? row.price)}</span>
          {row.salePrice != null && (
            <span className="text-xs line-through text-qgray">{fmtPrice(row.price)}</span>
          )}
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        <span className="text-qblack">{row.stock ?? 0}</span>
      </td>
      <td className="py-3 px-3 text-center">
        <StatusPill status={row.status} visibility={row.visibility} />
      </td>
      <td className="py-3 px-3 text-center">
        <span className="text-qgray text-xs">{fmtDate(row.createdAt)}</span>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(row)}
            className="h-[32px] px-3 border rounded hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => onTogglePublish(row)}
            className="h-[32px] px-3 border rounded hover:bg-gray-100"
          >
            {isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => onDelete(row)}
            className="h-[32px] px-3 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

ProductRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onTogglePublish: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function ProductsTable({ items, isLoading, isFetching, onEdit, onTogglePublish, onDelete }) {
  return (
    <div className="relative w-full overflow-x-auto sm:rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-50">
          <tr className="text-qgray">
            <th className="py-3 px-3">Product</th>
            <th className="py-3 px-3 text-center">Price</th>
            <th className="py-3 px-3 text-center">Stock</th>
            <th className="py-3 px-3 text-center">Status</th>
            <th className="py-3 px-3 text-center">Created</th>
            <th className="py-3 px-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {(isLoading || isFetching) && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-qgray">Loading...</td>
            </tr>
          )}
          {!isLoading && !isFetching && items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-qgray">No products found.</td>
            </tr>
          )}
          {items.map((row) => (
            <ProductRow
              key={row._id || row.id}
              row={row}
              onEdit={onEdit}
              onTogglePublish={onTogglePublish}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

ProductsTable.propTypes = {
  items: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onTogglePublish: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
