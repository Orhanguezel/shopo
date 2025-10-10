// src/components/products/ProductForm.jsx
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ImageUploader from "@/components/common/ImageUploader";

export default function ProductForm({ editing, onCancel, onSubmit, busy, error }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    categoryId: "",
    salePrice: "",
    slug: "",
    isPublished: true,
  });

  // Görsel durumları
  const [existing, setExisting] = useState([]);           // [{ _id, url, ... }]
  const [removedExisting, setRemovedExisting] = useState([]); // kaldırılan mevcut görseller
  const [files, setFiles] = useState([]);                 // File[]

  // Edit moda girince formu ve görselleri doldur
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing?.title?.en || editing?.title?.tr || editing?.slugCanonical || "",
        price: editing?.price ?? "",
        stock: editing?.stock ?? "",
        categoryId: editing?.categoryId || "",
        salePrice: editing?.salePrice ?? "",
        slug: editing?.slugCanonical || "",
        isPublished: editing?.status === "active" && editing?.visibility === "public",
      });
      setExisting(Array.isArray(editing?.images) ? editing.images : []);
      setRemovedExisting([]);
      setFiles([]);
    } else {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const resetAll = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      categoryId: "",
      salePrice: "",
      slug: "",
      isPublished: true,
    });
    setExisting([]);
    setRemovedExisting([]);
    setFiles([]);
  };

  const submit = (e) => {
    e.preventDefault();

    // Silinecekler: id varsa id, yoksa url gönder
    const removedImageIds = removedExisting.map((x) => x?._id).filter(Boolean);
    const removedImageUrls = removedExisting
      .filter((x) => !x?._id && x?.url)
      .map((x) => x.url);

    const payload = {
      ...(editing ? { id: editing._id || editing.id } : null),
      name: { tr: form.name, en: form.name },
      price: form.price,
      stock: form.stock || undefined,
      categoryId: form.categoryId,
      salePrice: form.salePrice || undefined,
      slug: form.slug || undefined,
      isPublished: !!form.isPublished,

      // Görsel alanları
      images: files,                // File[] — backend FormData ile alıyor
      removedImageIds,              // JSON array (backend bu isimlerle alabilir)
      removedImageUrls,             // JSON array (id yoksa url ile sil)
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border rounded px-3 py-2"
            placeholder="Product name"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Category ID</span>
          <input
            required
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="border rounded px-3 py-2"
            placeholder="ObjectId"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Price</span>
          <input
            required
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Sale Price (optional)</span>
          <input
            type="number"
            step="0.01"
            value={form.salePrice}
            onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Stock</span>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Slug (optional)</span>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          />
          <span className="text-sm">Published</span>
        </label>

        {/* ---- Image Uploader ---- */}
        <div className="md:col-span-2">
          <span className="block text-sm text-qgray mb-2">Images (up to 10)</span>
          <ImageUploader
            existing={existing}
            onExistingChange={setExisting}
            removedExisting={removedExisting}
            onRemovedExistingChange={setRemovedExisting}
            files={files}
            onFilesChange={setFiles}
            maxFiles={10}
            accept="image/*"
            sizeLimitMB={15}
            helpText="PNG/JPG/WebP • max 15MB"
            locale="tr"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => { resetAll(); onCancel(); }}
          className="h-[38px] px-4 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="h-[38px] px-5 bg-qyellow text-qblack font-semibold rounded"
        >
          {busy ? "Saving..." : editing ? "Save Changes" : "Create"}
        </button>
      </div>

      {!!error && (
        <div className="text-sm text-red-600">
          {error?.data?.message || "Save failed."}
        </div>
      )}
    </form>
  );
}

ProductForm.propTypes = {
  editing: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  error: PropTypes.any,
};
