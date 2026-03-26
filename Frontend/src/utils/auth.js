const TOKEN_KEY = 'consultancy_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getTokenPayload() {
  const token = getToken()
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

export function getUserRole() {
  return getTokenPayload()?.role || null
}

export function getCustomerId() {
  return getTokenPayload()?.customerId || null
}
