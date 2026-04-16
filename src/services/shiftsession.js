import api from "./api";

export function fetchShiftSession(id){
    return api.get(`view.shift.session.by.shift.id/${id}`)
}