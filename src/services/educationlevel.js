import api from "./api";

export function fetchEducationLevel(){
    return api.get('/view.education.level')
}