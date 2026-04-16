import api from "./api";

export function loginApi(data) {
    return api.post('/login',data)
}