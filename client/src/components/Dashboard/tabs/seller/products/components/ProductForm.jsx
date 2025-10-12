// src/components/products/ProductForm.jsx
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import ImageUploader from "@/components/common/ImageUploader";

/* seller ve kategoriler */
import { useGetMySellerQuery } from "@/api-manage/api-call-functions/public/publicSeller.api";
import { useGetPublicCategoriesQuery } from "@/api-manage/api-call-functions/public/publicCategories.api";

/* kategori adı tahmini */
const guessCatName = (c) =>
  (typeof c?.name === "string" && c.name) ||
  c?.name?.tr ||
  c?.name?.en ||
  c?.slug ||
  c?.slugLower?.en ||
  (c?.name && Object.values(c.name)[0]) ||
  "Category";

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

  // Görseller
  const [existing, setExisting] = useState([]);
  const [removedExisting, setRemovedExisting] = useState([]);
  const [files, setFiles] = useState([]);

  // -- Satıcının kategorileri + isimleri --
  const { data: mySeller } = useGetMySellerQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const sellerCatIds = useMemo(
    () => (Array.isArray(mySeller?.data?.categories) ? mySeller.data.categories.map(String)
         : Array.isArray(mySeller?.categories)        ? mySeller.categories.map(String)
         : []),
    [mySeller]
  );

  // Tüm public kategorileri çek → isimleri lazım (RTK Query)
  const { data: catsRes, isLoading: catsLoading } = useGetPublicCategoriesQuery({
    status: "active",
    pageSize: 1000,
  });

  const allCats = catsRes?.items ?? [];

  // Satıcının izinli olduğu kategoriler → dropdown seçenekleri
  const allowedCatOptions = useMemo(() => {
    const setIds = new Set(sellerCatIds);
    return allCats
      .filter((c) => setIds.has(String(c?._id || c?.id)))
      .map((c) => ({ id: String(c?._id || c?.id), name: guessCatName(c) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allCats, sellerCatIds]);

  // Düzenlenen ürünün kategorisi satıcının listesinde yoksa, görüntüde yine gösterelim
  const editingCatId = editing?.categoryId ? String(editing.categoryId) : "";
  const editingCatOption = useMemo(() => {
    if (!editingCatId) return null;
    const already = allowedCatOptions.some((o) => o.id === editingCatId);
    if (already) return null;
    const cat = allCats.find((c) => String(c?._id || c?.id) === editingCatId);
    return {
      id: editingCatId,
      name: (cat ? guessCatName(cat) : "Unknown category") + "  — currently assigned (not in your allowed set)",
      _notAllowed: true,
    };
  }, [editingCatId, allowedCatOptions, allCats]);

  // Dropdown’da göstereceğimiz nihai liste
  const categoryOptions = useMemo(() => {
    if (editingCatOption) return [editingCatOption, ...allowedCatOptions];
    return allowedCatOptions;
  }, [allowedCatOptions, editingCatOption]);

  // Edit moda girince formu ve görselleri doldur
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing?.title?.en || editing?.title?.tr || editing?.slugCanonical || "",
        price: editing?.price ?? "",
        stock: editing?.stock ?? "",
        categoryId: editing?.categoryId ? String(editing.categoryId) : "",
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

  // Eğer yeni ürün ekleniyorsa ve tek bir izinli kategori varsa, otomatik seç
  useEffect(() => {
    if (!editing && !form.categoryId && allowedCatOptions.length === 1) {
      setForm((f) => ({ ...f, categoryId: allowedCatOptions[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedCatOptions]);

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

    const removedImageIds = removedExisting.map((x) => x?._id).filter(Boolean);
    const removedImageUrls = removedExisting.filter((x) => !x?._id && x?.url).map((x) => x.url);

    const payload = {
      ...(editing ? { id: editing._id || editing.id } : null),
      name: { tr: form.name, en: form.name },
      price: form.price,
      stock: form.stock || undefined,
      categoryId: form.categoryId, // dropdown seçimi
      salePrice: form.salePrice || undefined,
      slug: form.slug || undefined,
      isPublished: !!form.isPublished,
      images: files,
      removedImageIds,
      removedImageUrls,
    };

    onSubmit(payload);
  };

  // dropdown disabled kriterleri
  const noAllowedCategory = !catsLoading && allowedCatOptions.length === 0;

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

        {/* ---- Category (Dropdown) ---- */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-qgray">Category</span>
          <select
            required
            className="border rounded px-3 py-2"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            disabled={catsLoading || noAllowedCategory}
          >
            <option value="" disabled>
              {catsLoading
                ? "Loading categories…"
                : noAllowedCategory
                ? "No categories assigned to this seller"
                : "Select a category"}
            </option>

            {categoryOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {noAllowedCategory && (
            <span className="text-xs text-qred mt-1">
              Bu satıcıya atanmış kategori yok. Lütfen önce satıcı kategorilerini tanımlayın.
            </span>
          )}
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
          disabled={busy || noAllowedCategory || catsLoading}
          className="h-[38px] px-5 bg-qyellow text-qblack font-semibold rounded disabled:opacity-60"
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
