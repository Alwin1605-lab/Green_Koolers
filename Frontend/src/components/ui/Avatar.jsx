function Avatar({ 
  name, 
  src, 
  size = 'md',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg'
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (src) {
    return (
      <img 
        src={src} 
        alt={name || 'Avatar'} 
        className={`${sizeClasses[size]} object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {getInitials(name)}
    </div>
  )
}

export default Avatar
