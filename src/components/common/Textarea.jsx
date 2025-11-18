export const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          block w-full rounded-lg border px-3 py-2
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          resize-none custom-scrollbar
          ${error ? 'border-error-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};
