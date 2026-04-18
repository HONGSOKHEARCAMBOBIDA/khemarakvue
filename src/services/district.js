import api from "./api";

export function fetchDistrict(id){
    return api.get(`/view.district/${id}`)
}