import axios from 'axios'
import { getToken, setToken, getRefreshToken, setRefreshToken, removeAllTokens } from '../utils/token'
import router from '../router'
import { removeAuth } from '../utils/userdata'

const api = axios.create({
    baseURL: 'http://localhost:8080'
})

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// track whether refresh token request is already running
let isRefreshing = false

// រក្សាទុក Request ដែលកំពុងរង់ចាំ Token ថ្មី
let failedQueue = []

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else {
            resolve(token)
        }
    })
    failedQueue = []
}


api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config

        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        // If refresh token is missing → go to login immediately
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
            removeAllTokens()
          window.location.replace('/login')
            return Promise.reject(error)
        }

        // If already refreshing → queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            }).catch((err) => {
                return Promise.reject(err)
            })
        }

        // Start refreshing
        originalRequest._retry = true
        isRefreshing = true

        try {
            const response = await axios.post(
                'http://localhost:8080/refresh',
                { refresh_token: refreshToken }
            )

            const { access_token, refresh_token } = response.data.data

            // Save new tokens
            setToken(access_token)
            setRefreshToken(refresh_token)

            // Update default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

            // Retry all queued requests with new token
            processQueue(null, access_token)

            // Retry the original failed request
            originalRequest.headers.Authorization = `Bearer ${access_token}`
            return api(originalRequest)

        } catch (refreshError) {
            window.location.replace('/login')
            // Refresh token expired or revoked → force logout
            processQueue(refreshError, null)
            removeAllTokens()
            removeAuth()

            return Promise.reject(refreshError)

        } finally {
            isRefreshing = false
        }
    }
)

export default api