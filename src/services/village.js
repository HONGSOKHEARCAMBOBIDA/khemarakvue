import api from "./api";

export function fetchVillage(id){
    return api.get(`/view.village/${id}`)
}