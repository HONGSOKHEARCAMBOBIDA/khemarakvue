import api from "./api";

export function fetchCommunce(id){
    return api.get(`/view.communce/${id}`)
}