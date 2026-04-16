import api from "./api";

export function fetchPosition(departmentId){
    return api.get(`/view.position.bydepartment/${departmentId}`)
}