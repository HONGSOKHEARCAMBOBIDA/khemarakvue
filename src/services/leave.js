import api from "./api";

export function fetchLeave(params = {}){
    return api.get(`/view.leave`,{params})
}

export const createLeave = (formData) => api.post(`add.leave`,formData)

export function fetchLeaveType(){
    return api.get(`/view.leave.type`)
}

export function fetchLeaveDurationUnit(){
    return api.get(`view.leave.ducation.unit`)
}

export function fetchStatusLeave(){
    return api.get(`view.status.leave`)
}

export function approveLeave(id,formData){
    return api.put(`approve.leave/${id}`,formData)
}

export function updateleave(id,formData){
    return api.put(`edit.leave/${id}`,formData)
}