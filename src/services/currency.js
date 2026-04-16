import api from "./api";

export function fetchCurrency(){
    return api.get('/view.currency')
}