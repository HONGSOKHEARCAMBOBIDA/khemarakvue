import api from "./api";

export function fetchdrafpayroll(params = {}){
    return api.get(`view.draft.payroll`,{params})
}

export function fetchpayrolltype(){
    return api.get(`/view.payroll.type`)
}

export function createpayroll(formData){
    return api.post(`add.payroll`,formData)
}

export function fetchpayroll(params = {}){
    return api.get(`/view.payroll`,{params})
}

export function fetchpayrollstatus(){
    return api.get(`view.payroll.status`)
}

export function approvepayroll(id){
    return api.put(`approve.payroll/${id}`)
}