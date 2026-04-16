import api from "./api";

export function fetchBranch(){
    return api.get('/view.branch')
}