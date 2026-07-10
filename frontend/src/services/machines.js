import { api } from "./api";

const e = encodeURIComponent

export async function getMachines(){
    const companyId= localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?companyId=${e(companyId)}`)
    return data.data
}

export async function createMachine(name, model){
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?companyId=${e(companyId)}`,{
        method: 'POST',
        body: JSON.stringify({name, model}),
    })
    return data.data
}

export async function updateMachine(machineId, updates){
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?machineId=${e(machineId)}&companyId=${e(companyId)}`,{
        method: 'PATCH',
        body: JSON.stringify(updates),
    })
    return data.data
}

export async function deleteMachine(machineId){
    const companyId= localStorage.getItem('companyId')
    const data = await api(`/machineCRUD?machineId=${e(machineId)}&companyId=${e(companyId)}`,{
        method: 'DELETE',
    })
    return data
}
