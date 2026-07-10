import { api } from './api'

const e = encodeURIComponent

export async function getSensors() {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/sensorCRUD?companyId=${e(companyId)}`)
    return data.data
}

export async function createSensor(sensorData) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/sensorCRUD?companyId=${e(companyId)}`, {
        method: 'POST',
        body: JSON.stringify(sensorData),
    })
    return data.data
}

export async function updateSensor(sensorId, updates) {
    const companyId = localStorage.getItem('companyId')
    const { ranges, ...sensorFields } = updates

    if (Object.keys(sensorFields).length > 0) {
        await api(`/sensorCRUD?sensorId=${e(sensorId)}&companyId=${e(companyId)}`, {
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
    const data = await api(`/sensorCRUD?sensorId=${e(sensorId)}&companyId=${e(companyId)}`, {
        method: 'DELETE',
    })
    return data
}

export async function createRange(sensorId, range) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/activationRangesCRUD?companyId=${e(companyId)}`, {
        method: 'POST',
        body: JSON.stringify({ ...range, sensorId }),
    })
    return data.data
}

export async function deleteRange(activationId) {
    const companyId = localStorage.getItem('companyId')
    const data = await api(`/activationRangesCRUD?companyId=${e(companyId)}&activationId=${e(activationId)}`, {
        method: 'DELETE',
    })
    return data
}

export async function updateSensorRanges(sensorId, newRanges, oldRanges = []) {
    const companyId = localStorage.getItem('companyId')

    for (const r of oldRanges.filter(r => r.id)) {
        await api(`/activationRangesCRUD?companyId=${e(companyId)}&activationId=${e(r.id)}`, { method: 'DELETE' })
    }

    const sorted = [...newRanges].sort((a, b) => a.lowerBound - b.lowerBound)
    for (const range of sorted) {
        await api(`/activationRangesCRUD?companyId=${e(companyId)}`, {
            method: 'POST',
            body: JSON.stringify({ ...range, sensorId }),
        })
    }
}
