import api from "./api";

export function register(data) {
    return api.post('/add.user', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
}

export function registerAsFormData(formData) {
    return api.post('/add.user', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export function getuser(id) {
    return api.get(`/view.user.by.branch/${id}`)
}