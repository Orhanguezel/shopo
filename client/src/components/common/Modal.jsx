import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function Modal({ open, onClose, children, title }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // body scroll kilidi
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = "modal-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="
          relative bg-white w-full sm:max-w-2xl
          max-h-[90vh] sm:max-h-[85vh]
          rounded-t-xl sm:rounded-xl shadow-lg
          flex flex-col overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h3 id={titleId} className="text-base sm:text-lg font-semibold truncate pr-8">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded text-qgray hover:text-qblack hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.node,
  title: PropTypes.node,
};
