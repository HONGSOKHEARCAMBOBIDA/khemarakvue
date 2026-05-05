const AUTH_KEY = 'auth_data'

export function getAuth() {
  try {
    const data = localStorage.getItem(AUTH_KEY)
    return data ? JSON.parse(data) : null  // ✅ parse back to object
    // JSON.parse convert string to object
  } catch {
    return null
  }
}

export function setAuth(data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))  // ✅ convert to string first
    // JSON.stringify is convert object to string
}

export function removeAuth() {
    localStorage.removeItem(AUTH_KEY)
}