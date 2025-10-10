import PropTypes from "prop-types";

export default function InputCom({
  label = "",
  type = "text",
  name,
  placeholder = "",
  children = null,
  inputHandler = undefined,   // eski kullanım desteği
  onChange = undefined,       // yaygın kullanım
  value = undefined,          // controlled yapmak için
  inputClasses = "",
  labelClasses = "text-qgray text-[13px] font-normal",
  wrapperClasses = "h-[44px]", // YÜKSEKLİK artık wrapper'da
  containerClasses = "",
  ...rest
}) {
  const handleChange = inputHandler || onChange;
  const isControlled = value !== undefined;
  const id = name;

  const commonProps = {
    id,
    name,
    placeholder,
    ...(isControlled ? { value: value ?? "" } : {}),
    onChange: handleChange,
    readOnly: isControlled && !handleChange,
  };

  return (
    <div className={`input-com w-full ${containerClasses}`}>
      {label && (
        <label
          className={`input-label block mb-2 ${labelClasses || ""}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <div className={`input-wrapper border border-qgray-border w-full overflow-hidden relative rounded ${wrapperClasses}`}>
        {type === "textarea" ? (
          <textarea
            className={`placeholder:text-sm text-sm px-6 py-2 text-dark-gray w-full font-normal bg-white focus:ring-0 focus:outline-none resize-none ${inputClasses || ""}`}
            {...commonProps}
            {...rest}
          />
        ) : (
          <input
            type={type}
            className={`placeholder:text-sm text-sm px-6 py-2 text-dark-gray w-full font-normal bg-white focus:ring-0 focus:outline-none ${inputClasses || ""}`}
            {...commonProps}
            {...rest}
          />
        )}
        {children}
      </div>
    </div>
  );
}

InputCom.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  children: PropTypes.node,
  inputHandler: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inputClasses: PropTypes.string,
  labelClasses: PropTypes.string,
  wrapperClasses: PropTypes.string,
  containerClasses: PropTypes.string,
};
