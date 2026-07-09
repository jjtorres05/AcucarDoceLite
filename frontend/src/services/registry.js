import { api } from "./api"

export async function getDashboardData() {
  const companyId = localStorage.getItem('companyId')
  const data = await api(`/getDashboard?companyId=${companyId}`)
  return { notifications: data.notifications || [], plots: data.plots || [] }
}

export async function getDashboardReadings() {
  const { notifications } = await getDashboardData()
  return notifications
}

export async function getPlotData(sensorId) {
  const companyId = localStorage.getItem('companyId')
  const data = await api(`/getPlotOfSensor?sensorId=${sensorId}&companyId=${companyId}`)
  return data.data
}

export async function getSensorDashboard(sensorId, startDate, endDate) {
  const companyId = localStorage.getItem('companyId')
  const data = await api(
    `/sensorDashboard?sensorId=${sensorId}&companyId=${companyId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  )
  return { sensorData: data.sensorData || [], plotData: data.plotData || null }
}
