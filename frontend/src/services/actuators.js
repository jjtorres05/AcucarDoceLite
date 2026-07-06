import { api } from './api'

export async function getActuators() {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?companyId=${companyId}`)
    return data.data
}

export async function createActuator(actuatorData) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?companyId=${companyId}`, {
        method: 'POST',
        body: JSON.stringify(actuatorData),
    })
    return data.data
}

export async function updateActuator(actuatorId, updates) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?actuatorId=${actuatorId}&companyId=${companyId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    })
    return data.data
}

export async function deleteActuator(actuatorId) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?actuatorId=${actuatorId}&companyId=${companyId}`, {
        method: 'DELETE',
    })
    return data
}