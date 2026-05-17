import api from "./api";

export function fetchdrafpayroll(params = {}){
    return api.get(`view.draft.payroll`,{params})
}

export function fetchpayrolltype(){
    return api.get(`/view.payroll.type`)
}