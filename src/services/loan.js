import api from "./api";

export function fetchloan(params = {}){
    return api.get(`/view.loan`,{params})
}

export function createloan(formData){
    return api.post(`add.loan`,formData)
}