import api from "./api";

export function fetchRole(){
    return api.get('/viewrole')
}