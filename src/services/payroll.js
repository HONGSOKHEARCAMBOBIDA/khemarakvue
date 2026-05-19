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