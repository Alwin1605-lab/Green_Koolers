const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  neutral: 'badge-neutral',
  brand: 'badge-brand'
}

const statusVariants = {
  'Requested': 'status-requested',
  'Assigned': 'status-assigned',
  'In Progress': 'status-in-progress',
  'Completed': 'status-completed',
  'Cancelled': 'status-cancelled'
}

function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

function StatusBadge({ status, className = '' }) {
  const statusClass = statusVariants[status] || 'badge-neutral'
  return (
    <span className={`${statusClass} ${className}`}>
      {status}
    </span>
  )
}

Badge.Status = StatusBadge

export default Badge
