import api from "./api";

export function fetchEmployee(params = {}) {
    return api.get(`/view.employee`, { params });
}