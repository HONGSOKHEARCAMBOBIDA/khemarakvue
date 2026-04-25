import api from "./api";

export function fetchEmployee(params = {}) {
    return api.get(`/view.employee`, { params });
}

export const updateEmployee = (id, formData) =>
  api.put(`/edit.employee/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const updateEducation = (id,formData) => api.put(`/edit.education/${id}`,formData)
export const createEducation = (formData) => api.post(`add.education`,formData)