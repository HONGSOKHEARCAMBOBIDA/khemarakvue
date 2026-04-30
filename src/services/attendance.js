// src/services/attendance.js
import api from "./api";

export const createattendance = (formData) => api.post('check.in', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})


export const checkout = (formData) => api.post('check.out', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

export function fetchsession(){
  return api.get(`/view.shift.session`)
}