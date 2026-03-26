function StatCard({ 
  label,
  title,
  value, 
  change, 
  changeType = 'neutral',
  icon,
  color = 'emerald',
  iconBg,
  iconColor,
  className = '' 
}) {
  // Support both label and title props
  const displayLabel = label || title
  
  // Color configurations
  const colorConfig = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
  }
  
  const colorClasses = colorConfig[color] || colorConfig.emerald
  const bgClass = iconBg || colorClasses.bg
  const textClass = iconColor || colorClasses.text
  
  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-500'
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{displayLabel}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-1 ${changeColors[changeType]}`}>
              {changeType === 'positive' && '+'}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgClass} ${textClass}`}>
            {typeof icon === 'function' ? icon({ className: 'h-6 w-6' }) : icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
