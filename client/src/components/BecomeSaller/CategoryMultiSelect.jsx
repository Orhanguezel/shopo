import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";
import { useGetPublicCategoriesQuery } from "@/api-manage/api-call-functions/public/publicCategories.api";

const guessName = (c) =>
  (typeof c?.name === "string" && c.name) ||
  c?.name?.tr ||
  c?.name?.en ||
  c?.slug ||
  c?.slugLower?.en ||
  (c?.name && Object.values(c.name)[0]) ||
  "Category";

function CategoryMultiSelect({
  value,
  onChange,
  required,
  disabled,
  label,
}) {
  const [q, setQ] = useState("");

  // Aktif kategorileri çek (RTK Query)
  const { data, isLoading, isError, error } = useGetPublicCategoriesQuery({
    status: "active",
    pageSize: 1000,
  });

  // RTK’dan gelen veriyi normalize et
  const options = useMemo(() => {
    const items = data?.items || [];
    return items.map((c) => ({
      id: String(c?._id || c?.id),
      name: guessName(c),
    }));
  }, [data]);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.name.toLowerCase().includes(s));
  }, [options, q]);

  const toggle = (id) => {
    if (disabled) return;
    const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
    onChange?.(next);
  };

  return (
    <div>
      <h3 className="text-[18px] font-semibold text-qblack mb-2" aria-label={label}>
        {label} {required && <span className="text-qred">*</span>}
      </h3>

      <div className="mb-3">
        <InputCom
          label="Search categories"
          type="text"
          inputClasses="h-[44px]"
          name="category_search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={disabled}
        />
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-qgraytwo">Kategoriler yükleniyor…</div>
      )}

      {isError && (
        <div className="mb-4 text-sm text-qred">
          Kategori listesi alınamadı{error?.data?.message ? `: ${error.data.message}` : "."}
          &nbsp;Yine de aşağıdan ID yazarak seçim yapabilirsiniz.
        </div>
      )}

      {options.length > 0 && (
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-auto border border-gray-200 p-3 rounded">
          {filtered.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={value.includes(c.id)}
                onChange={() => toggle(c.id)}
                disabled={disabled}
              />
              <span>{c.name}</span>
            </label>
          ))}
          {!filtered.length && (
            <div className="col-span-full text-sm text-qgraytwo">
              Aramanıza uygun kategori bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* Fallback: ID’leri virgülle gir */}
      <InputCom
        label="Category IDs (comma separated; fallback)"
        type="text"
        inputClasses="h-[44px]"
        name="category_ids_fallback"
        value={(value || []).join(",")}
        onChange={(e) => {
          if (disabled) return;
          const raw = e.target.value || "";
          const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
          onChange?.(Array.from(new Set(ids)));
        }}
        disabled={disabled}
      />
      <p className="text-xs text-qgraytwo mt-1">
        Yukarıdaki listeden seçim yapabilir veya bu alana kategori ID’lerini girebilirsiniz.
      </p>
    </div>
  );
}

CategoryMultiSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

CategoryMultiSelect.defaultProps = {
  value: [],
  required: true,
  disabled: false,
  label: "Categories",
};

export default CategoryMultiSelect;
