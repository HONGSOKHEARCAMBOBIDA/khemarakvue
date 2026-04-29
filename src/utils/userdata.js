const AUTH_KEY = 'auth_data'

export function getAuth() {
    return localStorage.getItem(AUTH_KEY)
    
}

export function setAuth(data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))  // ✅ convert to string first
}

export function removeAuth() {
    localStorage.removeItem(AUTH_KEY)
}