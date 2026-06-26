import { jsx } from "react/jsx-runtime";
import { api } from "./api";

export async function getMachines(){
    const companyId= localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?companyId=${companyId}`) 
    return data.data
}

export async function createMachine(nome, modelo){
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?companyId=${companyId}`,{
        method: 'POST',
        body: JSON.stringify({nome, modelo}),
    })
    return data.data
}

export async function updateMachine(machineId, updates){
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?machine=${machineId}&companyId=${companyId}`,{
        method: 'PATCH',
        body: JSON.stringify(upadates),
    })
    return data.data
}

export async function deleteMachine(machineId){
    const companyId= localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?machineId=${machineId}&companyId=${companyId}`,{
        method: 'DELETE',
    })
    return data
}
