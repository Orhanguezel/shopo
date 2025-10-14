import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useGetPublicCategoriesQuery } from "@/api-manage/api-call-functions/public/publicCategories.api";
import InputCom from "@/components/Helpers/InputCom";

const guessName = (c) =>
  (typeof c?.name === "string" && c.name) ||
  c?.name?.tr ||
  c?.name?.en ||
  c?.slug ||
  c?.slugLower?.en ||
  (c?.name && Object.values(c.name)[0]) ||
  "Category";

export default function CategoryMultiSelect({
  // ⚠️ defaultProps → varsayılan parametre
  value = [],
  onChange = () => {},
  required = true,
  disabled = false,
  label = "Categories",
  placeholder = "Select categories",
  maxRender = 3,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const { data, isLoading, isError } = useGetPublicCategoriesQuery({
    status: "active",
    pageSize: 1000,
  });

  const options = useMemo(() => {
    const items = data?.items || [];
    return items.map((c) => ({
      id: String(c?._id || c?.id),
      name: guessName(c),
    }));
  }, [data]);

  const nameById = useMemo(() => {
    const map = new Map();
    options.forEach((o) => map.set(o.id, o.name));
    return map;
  }, [options]);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.name.toLowerCase().includes(s));
  }, [options, q]);

  const toggle = (id) => {
    if (disabled) return;
    const next = value.includes(id)
      ? value.filter((x) => x !== id)
      : [...value, id];
    onChange(next);
  };

  const selectAllVisible = () => {
    if (disabled) return;
    const ids = filtered.map((o) => o.id);
    const union = Array.from(new Set([...value, ...ids]));
    onChange(union);
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const selectedNames = useMemo(() => {
    const names = value.map((id) => nameById.get(id)).filter(Boolean);
    if (names.length <= maxRender) return names.join(", ");
    return `${names.slice(0, maxRender).join(", ")} +${names.length - maxRender}`;
  }, [value, nameById, maxRender]);

  return (
    <div className="relative" ref={boxRef}>
      <h3 className="text-[18px] font-semibold text-qblack mb-2">
        {label} {required && <span className="text-qred">*</span>}
      </h3>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-[44px] border border-gray-200 rounded px-3 flex items-center justify-between ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-gray-300"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${value.length ? "text-qblack" : "text-qgraytwo"}`}>
          {value.length ? selectedNames : placeholder}
        </span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg" role="listbox">
          <div className="p-3 border-b border-gray-100">
            <InputCom
              label="Search"
              type="text"
              inputClasses="h-[40px]"
              name="category_search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={disabled}
            />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={selectAllVisible} disabled={disabled || !filtered.length} className="px-2 h-8 border rounded text-xs">Select visible</button>
              <button type="button" onClick={clearAll} disabled={disabled || !value.length} className="px-2 h-8 border rounded text-xs">Clear all</button>
            </div>
          </div>

          <div className="max-h-64 overflow-auto p-2">
            {isLoading && <div className="text-sm text-qgraytwo px-2 py-1">Kategoriler yükleniyor…</div>}
            {isError && <div className="text-sm text-qred px-2 py-1">Kategori listesi alınamadı.</div>}
            {!isLoading && filtered.length === 0 && (
              <div className="text-sm text-qgraytwo px-2 py-1">Aramanıza uygun kategori bulunamadı.</div>
            )}

            {filtered.map((c) => {
              const checked = value.includes(c.id);
              return (
                <label key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${checked ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                  <input type="checkbox" className="w-4 h-4" checked={checked} onChange={() => toggle(c.id)} disabled={disabled} />
                  <span className="text-sm">{c.name}</span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-2 border-t border-gray-100">
            <span className="text-xs text-qgraytwo">{value.length} selected</span>
            <button type="button" className="text-sm px-3 h-8 rounded bg-qblack text-white disabled:opacity-60" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

CategoryMultiSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  maxRender: PropTypes.number,
};
