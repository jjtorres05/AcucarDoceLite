const BASE_URL = 'http://localhost:7071/api'

export async function api(endpoint,options= {}) {
    const token= localStorage.getItem('token')
    const config={
        headers :{
            'Content-Type':'applicatio/json', ...(token && {Authorization: `Bearer ${token}`}),
        },
        ...options,
    }
    const response = await fetch (`${BASE_URL}${endpoint}`, config)

    if(response.status === 401){
        localStorage.removeItem('token')
        localStorage.removeItem('companyId')
        window.location.href = '/login'
        throw new Error('Nao autorizado')
    }
    const data = await response.json()

    if(!response.ok){
        throw {status: response.status, ...data}
    }

    return data
}