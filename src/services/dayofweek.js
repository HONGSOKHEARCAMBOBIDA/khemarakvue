import api from "./api";

export function fetchDayofweek(){
    return api.get('/view.day.of.week')
}