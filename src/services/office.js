import api from "./api";

export function fetchOffice(){
    return api.get('/view.office')
}