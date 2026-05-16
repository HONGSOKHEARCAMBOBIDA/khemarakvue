import api from "./api";

export function fetchRecieve(id){
    return api.get(`/view.recieve/${id}`)
}