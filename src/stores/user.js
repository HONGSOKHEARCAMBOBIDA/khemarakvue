import { defineStore } from 'pinia'
import { getAuth, setAuth, removeAuth } from '../utils/userdata'
import { setToken, setRefreshToken, removeAllTokens } from '../utils/token'

export const useAuthStore1 = defineStore('authuser', {
    state: () => ({
        auth: getAuth() || null
    }),

    getters: {
        isAuthenticated: (state) => !!state.auth?.access_token,
        parts: (state) => state.auth?.parts,
        name: (state) => state.auth?.name,
        permissions: (state) => state.auth?.permissions,
    },

    actions: {
        login(response) {
            const authData = {
                access_token: response.access_token, 
                name: response.name,
                parts: response.parts,
                permissions: response.permissions,
            }

            this.auth = authData
            setAuth(authData)
            setToken(response.access_token)
            setRefreshToken(response.refresh_token)     // ← new
        },

        logout() {
            this.auth = null
            removeAuth()
            removeAllTokens()   // ← removes both tokens
        }
    }
})