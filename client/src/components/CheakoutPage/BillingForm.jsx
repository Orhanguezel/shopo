// src/pages/checkout/BillingForm.jsx
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import InputCom from "@/components/Helpers/InputCom";

import { useMeQuery } from "@/api-manage/api-call-functions/public/publicAuth.api";
import {
  useListUserAddressesQuery,
  useCreateAddressMutation,
} from "@/api-manage/api-call-functions/public/publicAddress.api";

const toAddressPayload = (f) => ({
  addressType: "shipping",
  addressLine: f.address?.trim(),
  street: undefined,
  city: f.city?.trim() || undefined,
  province: undefined,
  postalCode: f.zip?.trim() || undefined,
  country: f.country?.trim() || undefined,
  phone: f.phone?.trim() || undefined,
  email: f.email?.trim() || undefined,
});

const splitName = (full = "") => {
  const p = String(full).trim().split(/\s+/);
  return [p[0] || "", p.slice(1).join(" ") || ""];
};

export default function BillingForm({ form, setForm }) {
  const { data: me } = useMeQuery();
  const { data: addresses = [] } = useListUserAddressesQuery();
  const [createAddress, { isLoading: savingShipping }] = useCreateAddressMutation();

  const initName = useRef(false);
  const initAddr = useRef(false);
  const autoSavedOnce = useRef(false);

  // me -> first/last/email/phone
  useEffect(() => {
    if (!me || initName.current) return;
    const [fn, ln] = splitName(me.name || "");
    setForm((f) => ({
      ...f,
      firstName: f.firstName || fn,
      lastName:  f.lastName  || ln,
      email:     f.email     || me.email || "",
      phone:     f.phone     || me.phone || "",
    }));
    initName.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // shipping > saved shipping address (telefon DAHİL)
  useEffect(() => {
    if (initAddr.current) return;

    const shipping = addresses.find((a) => a?.addressType === "shipping");
    if (shipping) {
      setForm((f) => ({
        ...f,
        country: shipping.country     || f.country || "",
        address: shipping.addressLine || shipping.street || f.address || "",
        city:    shipping.city        || f.city || "",
        zip:     shipping.postalCode  || f.zip  || "",
        phone:   shipping.phone       || f.phone || "",   // ✅ telefonu da kopyala
        email:   f.email, // email'i me effect'i dolduruyor; üzerine yazma
      }));
      initAddr.current = true;
      return;
    }

    // me.address fallback (telefonu mevcutsa koru; yoksa f.phone bırak)
    if (me?.address) {
      setForm((f) => ({
        ...f,
        country: f.country || me.address.country || "",
        address: f.address || me.address.line1 || me.address.street || "",
        city:    f.city    || me.address.city || "",
        zip:     f.zip     || me.address.zip  || me.address.postalCode || "",
        phone:   f.phone, // me.address.phone olmayabilir; me.phone üstte ayarlanıyor
      }));
      initAddr.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses, me]);

  // shipping yoksa form dolunca otomatik kaydet (telefon ve zip zorunlu!)
  const hasShipping = addresses.some((a) => a?.addressType === "shipping");
  useEffect(() => {
    if (hasShipping || autoSavedOnce.current) return;

    const filled = (v) => String(v || "").trim().length > 0;
    const ok =
      filled(form.address) &&
      filled(form.country) &&
      filled(form.city) &&
      filled(form.zip) &&        // ✅ zip zorunlu
      filled(form.phone);        // ✅ phone zorunlu — telefonsuz kayıt engellendi

    if (!ok) return;

    autoSavedOnce.current = true;
    (async () => {
      try {
        await createAddress(toAddressPayload(form)).unwrap();
        toast.success("Shipping address saved.");
      } catch (e) {
        autoSavedOnce.current = false;
        console.error("Auto-save shipping failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShipping, form.address, form.country, form.city, form.zip, form.phone, form.email]);

  return (
    <>
      <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">Billing Details</h1>

      <div className="form-area">
        <div className="sm:flex sm:space-x-5 items-center mb-6">
          <div className="sm:w-1/2 mb-5 sm:mb-0">
            <InputCom
              label="First Name*"
              name="firstName"
              type="text"
              placeholder="Jane"
              inputClasses="w-full h-[50px]"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <InputCom
              label="Last Name*"
              name="lastName"
              type="text"
              placeholder="Doe"
              inputClasses="w-full h-[50px]"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex space-x-5 items-center mb-6">
          <div className="w-1/2">
            <InputCom
              label="Email Address*"
              name="email"
              type="email"
              placeholder="you@example.com"
              inputClasses="w-full h-[50px]"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          <div className="flex-1">
            <InputCom
              label="Phone Number*"
              name="phone"
              type="tel"
              placeholder="+49 123 456 789"
              inputClasses="w-full h-[50px]"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="mb-6">
          <InputCom
            label="Country*"
            name="country"
            type="text"
            placeholder="Country"
            inputClasses="w-full h-[50px]"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
        </div>

        <div className="mb-6">
          <InputCom
            label="Address*"
            name="address"
            type="text"
            placeholder="Your address here"
            inputClasses="w-full h-[50px]"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            autoComplete="street-address"
          />
        </div>

        <div className="flex space-x-5 items-center mb-6">
          <div className="w-1/2">
            <InputCom
              label="Town / City*"
              name="city"
              type="text"
              placeholder="City"
              inputClasses="w-full h-[50px]"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <InputCom
              label="Postcode / ZIP*"
              name="zip"
              type="text"
              placeholder="ZIP / Postcode"
              inputClasses="w-full h-[50px]"
              value={form.zip}
              onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex space-x-2 items-center mb-10">
          <input
            type="checkbox"
            id="create"
            checked={form.createAccount}
            onChange={(e) => setForm((f) => ({ ...f, createAccount: e.target.checked }))}
          />
          <label htmlFor="create" className="text-qblack text-[15px] select-none">
            Create an account?
          </label>
        </div>

        <div>
          <h1 className="text-2xl text-qblack font-medium mb-3">Shipping Details</h1>
          <div className="flex space-x-2 items-center mb-5">
            <input
              type="checkbox"
              id="sameaddr"
              checked={form.shipSame}
              onChange={(e) => setForm((f) => ({ ...f, shipSame: e.target.checked }))}
            />
            <label htmlFor="sameaddr" className="text-qblack text-[15px] select-none">
              Ship to the same address
            </label>
          </div>

          {!hasShipping && (
            <p className="text-xs text-qgray ml-1 -mt-3">
              No saved shipping address found. Once you fill the address above, we’ll save it
              as your shipping address{savingShipping ? "…" : ""}.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

BillingForm.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
};
