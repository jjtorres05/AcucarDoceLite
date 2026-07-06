import { api } from './api'

export async function getSensors() {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/sensorCRUD?companyId=${companyId}`)
    return data.data
}

export async function createSensor(sensorData) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/sensorCRUD?companyId=${companyId}`, {
        method: 'POST',
        body: JSON.stringify(sensorData),
    })
    return data.data
}

export async function updateSensor(sensorId, updates) {
    const companyId = localStorage.getItem('companyId')
    const { ranges, ...sensorFields } = updates

    if (Object.keys(sensorFields).length > 0) {
        await api(`/sensorCRUD?sensorId=${sensorId}&companyId=${companyId}`, {
            method: 'PATCH',
            body: JSON.stringify(sensorFields),
        })
    }

    if (ranges) {
        await updateSensorRanges(sensorId, ranges)
    }
}

export async function deleteSensor(sensorId) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/sensorCRUD?sensorId=${sensorId}&companyId=${companyId}`, {
        method: 'DELETE',
    })
    return data
}

export async function createRange(sensorId, range) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/activationRangesCRUD?companyId=${companyId}`, {
        method: 'POST',
        body: JSON.stringify({ ...range, sensorId }),
    })
    return data.data
}

export async function deleteRange(activationId) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/activationRangesCRUD?companyId=${companyId}&activationId=${activationId}`, {
        method: 'DELETE',
    })
    return data
}

export async function updateSensorRanges(sensorId, newRanges, oldRanges = []) {
    const companyId = localStorage.getItem('companyId')

    const deletePromises = oldRanges
        .filter(r => r.id)
        .map(r => api(`/activationRangesCRUD?companyId=${companyId}&activationId=${r.id}`, { method: 'DELETE' }))

    await Promise.all(deletePromises)

    const createPromises = newRanges.map(range =>
        api(`/activationRangesCRUD?companyId=${companyId}`, {
            method: 'POST',
            body: JSON.stringify({ ...range, sensorId }),
        })
    )

    await Promise.all(createPromises)
}