import { api } from './api'

const e = encodeURIComponent

export async function getActuators() {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?companyId=${e(companyId)}`)
    return data.data
}

export async function createActuator(actuatorData) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?companyId=${e(companyId)}`, {
        method: 'POST',
        body: JSON.stringify(actuatorData),
    })
    return data.data
}

export async function updateActuator(actuatorId, updates) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?actuatorId=${e(actuatorId)}&companyId=${e(companyId)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    })
    return data.data
}

export async function deleteActuator(actuatorId) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/actuatorCRUD?actuatorId=${e(actuatorId)}&companyId=${e(companyId)}`, {
        method: 'DELETE',
    })
    return data
}
