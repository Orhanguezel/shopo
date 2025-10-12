import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  useListGatewaysQuery,
  useCreateGatewayMutation,
  useUpdateGatewayMutation,
  useDeleteGatewayMutation,
  useTestGatewayMutation,
} from "@/api-manage/api-call-functions/admin/adminGateways.api";
import GatewayForm from "./GatewayForm";

const PROVIDERS = ["stripe","paypal","iyzico","paytr","papara","paycell","craftgate","manual"];

function Row({ gw, onEdit, onDelete, onTest, busy }) {
  return (
    <tr className="border-b">
      <td className="py-2 px-3 font-medium uppercase">{gw.provider}</td>
      <td className="py-2 px-3">{gw.mode}</td>
      <td className="py-2 px-3">{gw.isActive ? "Active" : "Disabled"}</td>
      <td className="py-2 px-3 text-sm text-qgray">
        {gw.updatedAt ? new Date(gw.updatedAt).toLocaleString() : "-"}
      </td>
      <td className="py-2 px-3 flex gap-2">
        <button
          type="button"
          className="border px-3 h-[34px] rounded"
          onClick={() => onTest(gw)}
          disabled={busy}
        >
          Test
        </button>
        <button
          type="button"
          className="border px-3 h-[34px] rounded"
          onClick={() => onEdit(gw)}
          disabled={busy}
        >
          Edit
        </button>
        <button
          type="button"
          className="border px-3 h-[34px] rounded text-red-600"
          onClick={() => onDelete(gw)}
          disabled={busy}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
Row.propTypes = {
  gw: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTest: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};

export default function GatewaysManager() {
  const [filterProvider, setFilterProvider] = useState("");
  const { data = [], isFetching, refetch } = useListGatewaysQuery(
    filterProvider ? { provider: filterProvider } : undefined
  );

  const [editing, setEditing] = useState(null); // null | gateway doc
  const [isOpen, setIsOpen] = useState(false);

  const [createGateway, { isLoading: creating }] = useCreateGatewayMutation();
  const [updateGateway, { isLoading: updating }] = useUpdateGatewayMutation();
  const [deleteGateway, { isLoading: deleting }] = useDeleteGatewayMutation();
  const [testGateway,   { isLoading: testing }] = useTestGatewayMutation();

  const busy = creating || updating || deleting || testing;

  const onAdd = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const onEdit = (gw) => {
    setEditing(gw);
    setIsOpen(true);
  };

  const onDeleteClick = async (gw) => {
    if (!confirm(`Delete gateway "${gw.provider}"?`)) return;
    try {
      await deleteGateway(gw._id).unwrap();
      refetch();
    } catch (e) {
      console.error(e);
      alert(e?.data?.message || "Delete failed.");
    }
  };

  const onTest = async (gw) => {
    try {
      const r = await testGateway(gw._id).unwrap();
      alert(
        `Provider: ${r?.provider || gw.provider}\nMode: ${r?.mode || gw.mode}\nCredentials OK: ${
          r?.credentialsOk ? "YES" : "NO"
        }`
      );
    } catch (e) {
      console.error(e);
      alert(e?.data?.message || "Test failed.");
    }
  };

  const onSubmit = async (vals) => {
    try {
      if (editing?._id) {
        await updateGateway({ id: editing._id, ...vals }).unwrap();
      } else {
        await createGateway(vals).unwrap();
      }
      setIsOpen(false);
      refetch();
    } catch (e) {
      console.error(e);
      alert(e?.data?.message || "Save failed.");
    }
  };

  const rows = useMemo(() => data, [data]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Gateways</h2>
        <div className="flex gap-2">
          <select
            className="border px-3 h-[38px] rounded"
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
          >
            <option value="">All providers</option>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="black-btn h-[38px] px-4"
            onClick={onAdd}
            disabled={busy}
          >
            Add Gateway
          </button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3">Provider</th>
              <th className="py-2 px-3">Mode</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Updated</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan="5" className="py-6 text-center">
                  Loading…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((gw) => (
                <Row
                  key={gw._id || gw.provider}
                  gw={gw}
                  onEdit={onEdit}
                  onDelete={onDeleteClick}
                  onTest={onTest}
                  busy={busy}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-qgray">
                  No gateways.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer / Inline panel */}
      {isOpen && (
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              {editing ? "Edit Gateway" : "Add Gateway"}
            </h3>
            <button
              type="button"
              className="text-qgray"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>

          <GatewayForm
            key={editing?._id || "new"}
            initial={editing}
            loading={busy}
            onSubmit={onSubmit}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
