import { useMemo, useState } from "react";
import Modal from "@/components/common/Modal";
import Toolbar from "./components/Toolbar";
import ProductsTable from "./components/ProductsTable";
import Pagination from "./components/Pagination";

import {
  useListMyProductsQuery,
  useCreateMyProductMutation,
  useUpdateMyProductMutation,
  useDeleteMyProductMutation,
} from "@/api-manage/api-call-functions/public/sellerProduct.api";

import ProductForm from "./components/ProductForm";

export default function SellerProductsTab() {
  // ---- filters & pagination ----
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const listParams = useMemo(
    () => ({ q: q || undefined, status: status || undefined, page, pageSize }),
    [q, status, page]
  );

  const { data, isFetching, isLoading, refetch } = useListMyProductsQuery(listParams, {
    refetchOnMountOrArgChange: true,
  });

  const items = data?.items || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };

  // ---- mutations ----
  const [createProduct, createState] = useCreateMyProductMutation();
  const [updateProduct, updateState] = useUpdateMyProductMutation();
  const [deleteProduct] = useDeleteMyProductMutation();

  // ---- modal / edit ----
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const startCreate = () => { setEditing(null); setOpenModal(true); };
  const startEdit = (row) => { setEditing(row); setOpenModal(true); };

  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        await updateProduct(payload).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      setOpenModal(false);
      setPage(1);
      refetch();
    } catch (err) {
      // hata form içinde gösterilecek
      // eslint-disable-next-line no-console
      console.error("save failed:", err);
    }
  };

  const confirmDelete = async (row) => {
    if (!window.confirm(`Silinsin mi? "${row?.title?.en || row?.title?.tr || row?._id}"`)) return;
    try {
      await deleteProduct({ id: row._id || row.id }).unwrap();
      refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("delete failed:", err);
    }
  };

  const togglePublish = async (row) => {
    const isPub = row.status === "active" && row.visibility === "public";
    try {
      await updateProduct({
        id: row._id || row.id,
        status: isPub ? "draft" : "active",
        visibility: isPub ? "draft" : "public",
      }).unwrap();
      refetch();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("toggle failed:", e);
    }
  };

  return (
    <>
      <Toolbar
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        onFilter={() => { setPage(1); refetch(); }}
        onAdd={startCreate}
      />

      <ProductsTable
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        onEdit={startEdit}
        onTogglePublish={togglePublish}
        onDelete={confirmDelete}
      />

      <Pagination
        page={meta.page || page}
        pages={meta.pages || 1}
        total={meta.total || 0}
        setPage={setPage}
      />

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editing ? "Edit Product" : "Add Product"}
      >
        <ProductForm
          editing={editing}
          onCancel={() => setOpenModal(false)}
          onSubmit={handleSave}
          busy={createState.isLoading || updateState.isLoading}
          error={createState.error || updateState.error}
        />
      </Modal>
    </>
  );
}
