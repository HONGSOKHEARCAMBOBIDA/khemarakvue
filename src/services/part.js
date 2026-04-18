import api from "./api";

export function fetchPart(){
    return api.get('/view.part')
}