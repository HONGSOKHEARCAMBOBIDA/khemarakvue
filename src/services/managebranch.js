import api from "./api";

export function fetchManageBranch(){
    return api.get('/view.manage.branch')
}