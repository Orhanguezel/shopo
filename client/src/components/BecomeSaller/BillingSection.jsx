import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";

export default function BillingSection({
  taxNo, setTaxNo,
  iban, setIban,
  curr, setCurr,
  ptDays, setPtDays,
  dueDom, setDueDom,
  disabled,
}) {
  return (
    <>
      <h3 className="text-[18px] font-semibold text-qblack mb-3">Billing</h3>

      <div className="flex sm:flex-row flex-col gap-5 mb-5">
        <InputCom
          label="Tax Number"
          type="text"
          inputClasses="h-[50px]"
          name="tax_number"
          value={taxNo}
          onChange={(e)=>setTaxNo(e.target.value)}
          disabled={disabled}
        />
        <InputCom
          label="IBAN"
          type="text"
          inputClasses="h-[50px]"
          name="iban"
          value={iban}
          onChange={(e)=>setIban(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="flex sm:flex-row flex-col gap-5 mb-5">
        <div className="sm:w-1/3 w-full">
          <label className="block text-sm font-semibold mb-2">Default Currency</label>
          <select
            className="w-full border border-gray-200 h-[50px] px-3"
            value={curr}
            onChange={(e)=>setCurr(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
          </select>
        </div>

        <div className="sm:w-1/3 w-full">
          <InputCom
            label="Payment Term (days)"
            type="number"
            inputClasses="h-[50px]"
            name="payment_term_days"
            value={ptDays}
            onChange={(e)=>setPtDays(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="sm:w-1/3 w-full">
          <InputCom
            label="Due Day of Month (1-28)"
            type="number"
            inputClasses="h-[50px]"
            name="default_due_dom"
            value={dueDom}
            onChange={(e)=>setDueDom(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}

BillingSection.propTypes = {
  taxNo: PropTypes.string,
  setTaxNo: PropTypes.func.isRequired,
  iban: PropTypes.string,
  setIban: PropTypes.func.isRequired,
  curr: PropTypes.string,
  setCurr: PropTypes.func.isRequired,
  ptDays: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setPtDays: PropTypes.func.isRequired,
  dueDom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setDueDom: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

BillingSection.defaultProps = {
  taxNo: "",
  iban: "",
  curr: "",
  ptDays: "",
  dueDom: "",
  disabled: false,
};
