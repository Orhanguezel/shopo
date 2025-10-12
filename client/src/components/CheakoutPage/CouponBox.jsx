import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function CouponBox({ onApply, busy }) {
  const [code, setCode] = useState("");

  return (
    <div className="w-full sm:mb-10 mb-5">
      <div className="sm:flex sm:space-x-[18px]">
        <div className="sm:w-1/2 w-full mb-5 sm:mb-0 h-[70px]">
          <Link to="/login">
            <div className="w-full h-full bg-[#F6F6F6] text-qblack flex justify-center items-center">
              <span className="text-[15px] font-medium">Log into your Account</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 h-[70px]">
          <div className="w-full h-full bg-[#F6F6F6] text-qblack flex items-center justify-between px-4">
            <span className="text-[15px] font-medium">Enter Coupon Code</span>
            <div className="flex items-center gap-2">
              <input
                className="h-[40px] border border-[#EDEDED] rounded px-3 text-sm"
                placeholder="e.g. SAVE10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="button"
                disabled={!code || busy}
                onClick={() => onApply(code)}
                className="h-[40px] px-4 bg-qblack text-white rounded disabled:opacity-60"
              >
                {busy ? "Applying..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CouponBox.propTypes = {
  onApply: PropTypes.func.isRequired,
  busy: PropTypes.bool,
};
