import api from "./api";

export function register(data) {
    return api.post('/add.user', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

// Optional: Convert object to form-data
export function registerAsFormData(data) {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key].forEach((item, index) => {
                if (item !== null && item !== undefined && item !== '') {
                    formData.append(`${key}[${index}]`, item)
                }
            })
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            formData.append(key, data[key])
        }
    })
    
    return api.post('/add.user', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}