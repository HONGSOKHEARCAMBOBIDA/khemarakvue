import api from './api'

export function fetchDepartment() {
  return api.get('/view.department')
}