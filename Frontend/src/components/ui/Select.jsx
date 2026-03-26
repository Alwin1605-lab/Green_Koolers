import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    required = false,
    className = '',
    options = [],
    placeholder = 'Select an option',
    ...props
  },
  ref
) {
  return (
    <div className="form-group">
      {label && (
        <label className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`select ${error ? 'border-red-300 focus:border-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
})

export default Select
