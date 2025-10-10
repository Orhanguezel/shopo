import PropTypes from "prop-types";
import { useCallback } from "react";

export default function InputQuantityCom({
  value,
  onChange,
  min = 1,
  max = 999,
  className = "",
}) {
  // value undefined gelirse min’i kullan
  const current = Number.isFinite(value) ? value : min;

  const inc = useCallback(() => {
    const next = Math.min(max, Number(current || 0) + 1);
    onChange?.(next);
  }, [current, max, onChange]);

  const dec = useCallback(() => {
    const next = Math.max(min, Number(current || 0) - 1);
    onChange?.(next);
  }, [current, min, onChange]);

  return (
    <div
      className={`w-[120px] h-[40px] px-[26px] flex items-center border border-qgray-border ${className}`}
    >
      <div className="flex justify-between items-center w-full">
        <button onClick={dec} type="button" className="text-base text-qgray" aria-label="decrease">
          -
        </button>
        <span className="text-qblack">{current}</span>
        <button onClick={inc} type="button" className="text-base text-qgray" aria-label="increase">
          +
        </button>
      </div>
    </div>
  );
}

InputQuantityCom.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  className: PropTypes.string,
};
