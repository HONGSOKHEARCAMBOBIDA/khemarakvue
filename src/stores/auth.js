import { defineStore } from 'pinia'
import { getToken, setToken, removeToken, removeAllTokens } from '../utils/token'
import { removeAuth,getAuth } from '../utils/userdata'
// បង្កេីត store
export const useAuthStore = defineStore('auth',{
    

    // 'auth' ជា name របស់ store
    // useAuthStore → function ដែលយើង call នៅ component

    state: ()=>({
        token : getToken() || null,
        user: getAuth()
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
        login(token){
            this.otken = token
            setToken(token)
        },
        logout(){
            this.token = null
            this.user = null
            removeToken()
            removeAuth()
            removeAllTokens()
        }
    }
})