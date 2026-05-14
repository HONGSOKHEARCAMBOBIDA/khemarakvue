import api from "./api";

export function fetchloan(params = {}){
    return api.get(`/view.loan`,{params})
}

export function createloan(data) {
  const form = new FormData();
  form.append('employee_id',     data.employee_id);
  form.append('loan_amount',     data.loan_amount);
  form.append('currency_id',     data.currency_id);
  form.append('loan_start_date', data.loan_start_date);
  form.append('loan_purpose',    data.loan_purpose || '');
  form.append('loan_duration',   data.loan_duration);
  return api.post('/add.loan', form); 
}