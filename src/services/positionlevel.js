import api from "./api";

export function fetchPositionLevel(){
    return api.get('/view.position.level')
}