import api from "./api";

export function fetchEmployeetype() {
    return api.get('/view.employee.type')
}