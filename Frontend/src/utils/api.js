import { getToken } from './auth.js'
import { API_URL } from './constants.js'

const BASE_URL = API_URL

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers
    })
  } catch {
    throw new Error('Unable to reach backend. Please check server connection.')
  }

  const data = await parseResponseBody(response)
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`)
  }

  return data ?? {}
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' })
}
