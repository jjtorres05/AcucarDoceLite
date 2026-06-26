import { api } from "./api";
export async function login(email, password) {
    const data = await api('/login',{
        method: 'POST',
        body: JSON.stringify({email, password}),
    })
    localStorage.setItem('token', data.Bearer)
    return data   
}

export async function getCompanies(){
    const data = await api('/getCompaniesOfEmployee')
    return data.data
}

export function getToken(){
    return localStorage.getItem('token')
}