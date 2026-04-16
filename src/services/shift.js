import api from "./api";

export function fetchShift(id){
    return api.get(`/view.shift.by.branch.id/${id}`)
}