import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '../utils/token'
// បង្កេីត store
export const useAuthStore = defineStore('auth',{
    

    // 'auth' ជា name របស់ store
    // useAuthStore → function ដែលយើង call នៅ component

    state: ()=>({
        token : getToken() || null,
        user: null
    }),

    // state គឺ data ដែល global
    // token → ទាញពី getToken()
    // user → info user

    getters: {
        isAuthenticated: (state) => !!state.token

        // !!state.token → បំលែងជា true/false
        // ប្រសិនបើមាន token → true
        // គ្មាន token → false
    },

    actions: {
        login(token,user){
            this.token = token
            this.user = user
            setToken(token)
            // save token to state

        },
        logout(){
            this.token = null
            this.user = null
            removeToken()
            // remove token from state
        }
    }
})