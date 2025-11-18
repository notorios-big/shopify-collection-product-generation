export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  error,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          block w-full rounded-lg border px-3 py-2
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-error-500' : 'border-gray-300'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};
