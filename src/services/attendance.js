// src/services/attendance.js
import api from "./api";

export const createattendance = (formData) => api.post('check.in', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})