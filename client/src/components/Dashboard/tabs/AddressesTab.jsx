import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import InputCom from "@/components/Helpers/InputCom";

import {
  useListUserAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "@/api-manage/api-call-functions/public/publicAddress.api";

/** Backend ile aynı seçenekler */
const ADDRESS_TYPE_OPTIONS = [
  "home",
  "work",
  "billing",
  "shipping",
  "factory",
  "warehouse",
  "showroom",
  "branch",
  "seller",
  "other",
];

const prettyType = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");

/** Form state */
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  addressType: "shipping", // default
};

/** backend -> UI */
const toForm = (a = {}) => ({
  name: a.name || "",
  email: a.email || "",
  phone: a.phone || "",
  line1: a.addressLine || "",
  line2: a.street || "",
  city: a.city || "",
  state: a.province || "",
  zip: a.postalCode || "",
  country: a.country || "",
  addressType: a.addressType || "shipping",
});

/** UI -> backend */
const toPayload = (f) => ({
  addressType: f.addressType || "shipping",
  addressLine: f.line1?.trim(),
  street: f.line2?.trim() || undefined,
  city: f.city?.trim() || undefined,
  province: f.state?.trim() || undefined,
  postalCode: f.zip?.trim() || undefined,
  country: f.country?.trim() || undefined,
  phone: f.phone?.trim() || undefined,
  email: f.email?.trim() || undefined,
});

/** Select bileşeni */
function TypeSelect({ value, onChange, disabledOptions = [] }) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-qgray text-[13px]">Address Type</label>
      <div className="border border-qgray-border rounded overflow-hidden">
        <select
          className="w-full h-[44px] px-4 text-sm bg-white focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {ADDRESS_TYPE_OPTIONS.map((opt) => (
            <option
              key={opt}
              value={opt}
              disabled={disabledOptions.includes(opt)}
              title={
                disabledOptions.includes(opt)
                  ? `Only one ${opt} address allowed`
                  : ""
              }
            >
              {prettyType(opt)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

TypeSelect.propTypes = {
  value: PropTypes.oneOf(ADDRESS_TYPE_OPTIONS).isRequired,
  onChange: PropTypes.func.isRequired,
  disabledOptions: PropTypes.arrayOf(PropTypes.string),
};

export default function AddressesTab() {
  const { data: addresses = [], refetch, isFetching } = useListUserAddressesQuery();
  const [createAddress, { isLoading: creating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();

  const [editingIndex, setEditingIndex] = useState(null); // number | "new" | null
  const [form, setForm] = useState(emptyForm);

  const submitting = creating || updating || deleting;

  // Yardımcılar: bir tip başka kayıtta var mı?
  const isTypeTaken = (type) =>
    addresses.some((a, idx) => a.addressType === type && idx !== editingIndex);

  const disabledTypeOptions = [
    isTypeTaken("shipping") ? "shipping" : null,
    isTypeTaken("billing") ? "billing" : null,
  ].filter(Boolean);

  useEffect(() => {
    if (editingIndex == null) setForm(emptyForm);
  }, [editingIndex]);

  const startCreate = () => {
    // Varsayılan addressType: shipping boşsa shipping, değilse billing, o da doluysa home
    const defaultType = !isTypeTaken("shipping")
      ? "shipping"
      : !isTypeTaken("billing")
      ? "billing"
      : "home";

    setEditingIndex("new");
    setForm({ ...emptyForm, addressType: defaultType });
  };

  const startEdit = (i) => {
    const src = addresses[i] || {};
    setEditingIndex(i);
    setForm(toForm(src));
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setForm(emptyForm);
  };

  const onSave = async () => {
    if (!form.line1?.trim()) {
      toast.error("Lütfen Address alanını doldurun.");
      return;
    }
    if (!ADDRESS_TYPE_OPTIONS.includes(form.addressType)) {
      toast.error("Geçerli bir Address Type seçin.");
      return;
    }
    // Tekillik kontrolü (shipping/billing)
    if (["shipping", "billing"].includes(form.addressType) && isTypeTaken(form.addressType)) {
      toast.error(`Only one ${prettyType(form.addressType)} address is allowed.`);
      return;
    }

    try {
      if (editingIndex === "new") {
        await toast.promise(createAddress(toPayload(form)).unwrap(), {
          pending: "Adres ekleniyor...",
          success: "Adres eklendi.",
          error: "Adres eklenemedi.",
        });
      } else if (typeof editingIndex === "number") {
        const id = addresses[editingIndex]?._id;
        if (!id) return;
        await toast.promise(updateAddress({ id, ...toPayload(form) }).unwrap(), {
          pending: "Adres güncelleniyor...",
          success: "Adres güncellendi.",
          error: "Adres güncellenemedi.",
        });
      } else return;

      cancelEdit();
      await refetch().catch(() => {});
    } catch {
      /* toast verildi */
    }
  };

  const onDelete = async (i) => {
    const id = addresses[i]?._id;
    if (!id) return;
    try {
      await toast.promise(deleteAddress(id).unwrap(), {
        pending: "Adres siliniyor...",
        success: "Adres silindi.",
        error: "Adres silinemedi.",
      });
      if (editingIndex === i) cancelEdit();
      await refetch().catch(() => {});
    } catch {
      toast.error("Adres silinemedi.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-[30px]">
        {addresses.map((a, i) => {
          const isEditing = editingIndex === i;
          const view = {
            name: a.name,
            email: a.email,
            phone: a.phone,
            country: a.country,
            state: a.province,
            city: a.city,
            line1: a.addressLine,
            line2: a.street,
            zip: a.postalCode,
            type: a.addressType,
          };

          return (
            <div key={a._id || i} className="w-full bg-primarygray p-5 border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <p className="title text-[22px] font-semibold">Address #{i + 1}</p>
                  {view.type ? (
                    <span className="px-2 py-0.5 text-[12px] rounded bg-white border text-qblack">
                      {prettyType(view.type)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="border border-qgray px-3 h-[34px] rounded text-sm"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(i)}
                      className="border border-qgray px-3 h-[34px] rounded text-sm"
                      disabled={submitting}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className="border border-qgray w-[34px] h-[34px] rounded-full flex justify-center items-center"
                    onClick={() => onDelete(i)}
                    aria-label="Delete address"
                    disabled={submitting}
                  >
                    {/* trash icon */}
                    <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.7768 5.95215C15.6991 6.9104 15.6242 7.84603 15.5471 8.78237C15.3691 10.9285 15.1917 13.0747 15.0108 15.2209C14.9493 15.9473 14.9097 16.6773 14.8065 17.3988C14.6963 18.1726 14.0716 18.7161 13.2929 18.7196C10.3842 18.7323 7.47624 18.7337 4.56757 18.7189C3.70473 18.7146 3.08639 18.0794 3.00795 17.155C2.78181 14.493 2.57052 11.8302 2.35145 9.16821C2.2716 8.19442 2.1875 7.22133 2.10623 6.24824C2.09846 6.15638 2.09563 6.06451 2.08998 5.95286C6.65579 5.95215 11.2061 5.95215 15.7768 5.95215Z" fill="#EB5757"/>
                      <path d="M5.20143 2.75031C5.21486 2.49449 5.21839 2.2945 5.23747 2.09593C5.31733 1.25923 5.93496 0.648664 6.77449 0.637357C8.21115 0.618277 9.64923 0.618277 11.0859 0.637357C11.9254 0.648664 12.5438 1.25852 12.6236 2.09522C12.6427 2.2938 12.6462 2.49379 12.6582 2.73335C12.7854 2.739 12.9084 2.74889 13.0314 2.7496C13.9267 2.75101 14.8221 2.74677 15.7174 2.75172C16.4086 2.75525 16.8757 3.18774 16.875 3.81244C16.8742 4.43643 16.4078 4.87103 15.716 4.87174C11.1926 4.87386 6.66849 4.87386 2.14508 4.87174C1.45324 4.87103 0.986135 4.43713 0.985429 3.81314C0.984722 3.18915 1.45183 2.75525 2.14296 2.75243C3.15421 2.74677 4.16545 2.75031 5.20143 2.75031Z" fill="#EB5757"/>
                    </svg>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-5 grid grid-cols-1 gap-4">
                  {/* TYPE SELECT (shipping/billing tekil kontrolüyle) */}
                  <TypeSelect
                    value={form.addressType}
                    onChange={(val) => setForm((s) => ({ ...s, addressType: val }))}
                    disabledOptions={disabledTypeOptions}
                  />

                  <InputCom label="Full Name" type="text" name="name" value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputCom label="Email" type="email" name="email" value={form.email}
                              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                    <InputCom label="Phone" type="text" name="phone" value={form.phone}
                              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                  </div>

                  <InputCom label="Address" type="text" name="line1" value={form.line1}
                            onChange={(e) => setForm((s) => ({ ...s, line1: e.target.value }))} />
                  <InputCom label="Address Line 2" type="text" name="line2" value={form.line2}
                            onChange={(e) => setForm((s) => ({ ...s, line2: e.target.value }))} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputCom label="City" type="text" name="city" value={form.city}
                              onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
                    <InputCom label="State" type="text" name="state" value={form.state}
                              onChange={(e) => setForm((s) => ({ ...s, state: e.target.value }))} />
                    <InputCom label="ZIP / Postcode" type="text" name="zip" value={form.zip}
                              onChange={(e) => setForm((s) => ({ ...s, zip: e.target.value }))} />
                  </div>

                  <InputCom label="Country" type="text" name="country" value={form.country}
                            onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))} />

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onSave}
                            className="yellow-btn px-4 h-[42px] text-sm font-semibold disabled:opacity-60"
                            disabled={submitting}>
                      {submitting ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={cancelEdit}
                            className="border px-4 h-[42px] rounded text-sm" disabled={submitting}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <table>
                    <tbody>
                      {view.name ? (
                        <tr className="align-top">
                          <td className="text-base text-qgraytwo w-[70px] pr-3"><div>Name:</div></td>
                          <td className="text-base text-qblack font-medium">{view.name}</td>
                        </tr>
                      ) : null}
                      {view.email ? (
                        <tr className="align-top">
                          <td className="text-base text-qgraytwo w-[70px] pr-3"><div>Email:</div></td>
                          <td className="text-base text-qblack font-medium">{view.email}</td>
                        </tr>
                      ) : null}
                      {view.phone ? (
                        <tr className="align-top">
                          <td className="text-base text-qgraytwo w-[70px] pr-3"><div>Phone:</div></td>
                          <td className="text-base text-qblack font-medium">{view.phone}</td>
                        </tr>
                      ) : null}
                      {(view.country || view.state || view.city) ? (
                        <tr className="align-top">
                          <td className="text-base text-qgraytwo w-[70px] pr-3"><div>country:</div></td>
                          <td className="text-base text-qblack font-medium">
                            {[view.country, view.state, view.city].filter(Boolean).join(", ")}
                          </td>
                        </tr>
                      ) : null}
                      {(view.line1 || view.line2 || view.zip) ? (
                        <tr className="align-top">
                          <td className="text-base text-qgraytwo w-[70px] pr-3"><div>address:</div></td>
                          <td className="text-base text-qblack font-medium">
                            <span className="block">{view.line1}</span>
                            {view.line2 ? <span className="block">{view.line2}</span> : null}
                            {view.zip ? <span className="block">{view.zip}</span> : null}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* NEW CARD */}
        {editingIndex === "new" && (
          <div className="w-full bg-primarygray p-5 border">
            <div className="flex justify-between items-center">
              <p className="title text-[22px] font-semibold">New Address</p>
              <button type="button" className="border border-qgray px-3 h-[34px] rounded text-sm"
                      onClick={cancelEdit} disabled={submitting}>
                Cancel
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4">
              <TypeSelect
                value={form.addressType}
                onChange={(val) => setForm((s) => ({ ...s, addressType: val }))}
                disabledOptions={disabledTypeOptions}
              />

              <InputCom label="Full Name" type="text" name="name" value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputCom label="Email" type="email" name="email" value={form.email}
                          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                <InputCom label="Phone" type="text" name="phone" value={form.phone}
                          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
              </div>
              <InputCom label="Address" type="text" name="line1" value={form.line1}
                        onChange={(e) => setForm((s) => ({ ...s, line1: e.target.value }))} />
              <InputCom label="Address Line 2" type="text" name="line2" value={form.line2}
                        onChange={(e) => setForm((s) => ({ ...s, line2: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputCom label="City" type="text" name="city" value={form.city}
                          onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
                <InputCom label="State" type="text" name="state" value={form.state}
                          onChange={(e) => setForm((s) => ({ ...s, state: e.target.value }))} />
                <InputCom label="ZIP / Postcode" type="text" name="zip" value={form.zip}
                          onChange={(e) => setForm((s) => ({ ...s, zip: e.target.value }))} />
              </div>
              <InputCom label="Country" type="text" name="country" value={form.country}
                        onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))} />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onSave}
                        className="yellow-btn px-4 h-[42px] text-sm font-semibold disabled:opacity-60"
                        disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={cancelEdit}
                        className="border px-4 h-[42px] rounded text-sm" disabled={submitting}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-[180px] h-[50px] mt-4">
        <button type="button" className="yellow-btn w-full h-full"
                onClick={startCreate} disabled={submitting || isFetching}>
          <div className="w-full text-sm font-semibold">Add New Address</div>
        </button>
      </div>
    </>
  );
}
