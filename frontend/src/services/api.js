const BASE_URL = 'http://localhost:7071/api'

export async function api(endpoint,options= {}) {
    const token= localStorage.getItem('token')
    const config={
        headers :{
            'Content-Type':'application/json', ...(token && {Authorization: `Bearer ${token}`}),
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
        let message = data.msg || data.message || data.error || 'Erro desconhecido'
        if (response.status === 403) message = 'Acesso não permitido'
        if (response.status === 409) message = 'Elemento duplicado — já existe um registro com esses dados'
        if (response.status === 404) message = 'Recurso não encontrado'
        const err = new Error(message)
        err.status = response.status
        err.data = data
        throw err
    }

    return data
}