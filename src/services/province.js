import api from "./api";

export function fetchProvince(){
    return api.get('/view.province')
}