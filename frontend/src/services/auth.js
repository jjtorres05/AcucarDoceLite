import { api } from "./api";
export async function login(email, password) {
    const data = await api('/login',{
        method: 'POST',
        body: JSON.stringify({email, password}),
    })
    if (!data.Bearer) throw new Error('Token não recebido do servidor')
    localStorage.setItem('token', data.Bearer)
    return data
}

export async function getCompanies(){
    const data = await api('/getCompaniesOfEmployee')
    return data.data
}

export function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('companyId')
    localStorage.removeItem('companyName')
    localStorage.removeItem('roleCompany')
}

export function isAdmin(){
    return localStorage.getItem('roleCompany') === '1'
}

export function getToken(){
    return localStorage.getItem('token')
}