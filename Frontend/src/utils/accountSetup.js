export function requiresPasswordSetup(user) {
  if (!user) return false
  return user.role !== 'customer' && Boolean(user.mustChangePassword)
}

export function requiresProfileSetup(user) {
  if (!user) return false
  return !user.profileCompleted
}

export function requiresAccountSetup(user) {
  if (!user) return false
  return requiresPasswordSetup(user) || requiresProfileSetup(user)
}

export function isAccountSetupComplete(user) {
  if (!user) return false
  return !requiresAccountSetup(user)
}
