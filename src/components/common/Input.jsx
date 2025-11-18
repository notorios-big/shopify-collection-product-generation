export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
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
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full rounded-lg border
            ${Icon ? 'pl-10' : 'pl-3'}
            ${RightIcon ? 'pr-10' : 'pr-3'}
            py-2
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-error-500' : 'border-gray-300'}
          `}
          {...props}
        />
        {RightIcon && (
          <div
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            }`}
            onClick={onRightIconClick}
          >
            <RightIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};
