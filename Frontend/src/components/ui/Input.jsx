import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    required = false,
    className = '',
    type = 'text',
    icon: Icon,
    ...props
  },
  ref
) {
  const inputClass = error ? 'input-error' : 'input'
  const hasIcon = Boolean(Icon)

  return (
    <div className="form-group">
      {label && (
        <label className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <div className={hasIcon ? 'input-group' : ''}>
        {hasIcon && (
          <span className="input-icon">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`${hasIcon ? 'input-with-icon' : inputClass} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  )
})

export default Input
