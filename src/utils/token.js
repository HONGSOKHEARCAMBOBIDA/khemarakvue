// Access Token (short-lived, 15min)
export function getToken() {
    return localStorage.getItem('access_token')
}
export function setToken(token) {
    localStorage.setItem('access_token', token)
}
export function removeToken() {
    localStorage.removeItem('access_token')
}

// Refresh Token (long-lived, 30 days)
export function getRefreshToken() {
    return localStorage.getItem('refresh_token')
}
export function setRefreshToken(token) {
    localStorage.setItem('refresh_token', token)
}
export function removeRefreshToken() {
    localStorage.removeItem('refresh_token')
}

// Remove both at once (logout)
export function removeAllTokens() {
    removeToken()
    removeRefreshToken()
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}