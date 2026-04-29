import { defineStore } from 'pinia'
// import { getAuth, setAuth, removeAuth } from '../utils/token'
import { getAuth,setAuth,removeAuth } from '../utils/userdata'
export const useAuthStore1 = defineStore('authuser', {
    state: () => ({
        auth: getAuth() || null
    }),

getters: {
    isAuthenticated: (state) => !!state.auth?.token,
    token: (state) => state.auth?.token,
    branchID: (state) => state.auth?.branch_id,
    employeeID: (state) => state.auth?.employee_id,
    branchLatitude: (state) => state.auth?.branch_latitude,
    branchLongitude: (state) => state.auth?.branch_longitude,
    branchRadius: (state) => state.auth?.branch_radius,
    roleId: (state) => state.auth?.role_id,
    parts: (state) => state.auth?.parts,
},

actions: {
    login(response) {
        const authData = {
            token: response.Token,                      // ✅ ADD THIS BACK
            user_id: response.id,
            branch_id: response.branch_id,
            employee_id: response.employee_id,
            branch_latitude: response.branch_latitude,
            branch_longitude: response.branch_longitude,
            branch_radius: response.branch_radius,
            role_id: response.role_id,
            name: response.name,
            contact: response.contact,
            parts: response.parts,
        }

        this.auth = authData
        setAuth(authData)
    },

    logout() {
        this.auth = null
        removeAuth()
    }
}
})