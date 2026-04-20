import axios from 'axios'
import { getToken } from '../utils/token'

const api = axios.create({
  baseURL: 'http://localhost:8080'
})

//​ បង្កើត Axios Instance

api.interceptors.request.use((config) => {

   // ហៅថា request interceptor
   // មុនពេល request ចេញទៅ API → code នេះ run មុនគេ
   // វា check ថា មាន token ឬអត់
  
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }

    return Promise.reject(error)
  }
)


export default api