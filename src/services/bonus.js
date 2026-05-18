import api from "./api";

export const fetechbonustype = ()=>{
    return api.get(`/view.bonus.type`)
}