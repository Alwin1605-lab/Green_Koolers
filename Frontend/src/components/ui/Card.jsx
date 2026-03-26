function Card({ children, className = '', hover = false, dark = false, padding = true }) {
  const baseClass = dark ? 'card-dark' : hover ? 'card-hover' : 'card'
  const paddingClass = padding ? 'p-6' : ''
  
  return (
    <div className={`${baseClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`heading-sm ${className}`}>
      {children}
    </h3>
  )
}

function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`}>
      {children}
    </p>
  )
}

function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
