import { api } from "./api"

const e = encodeURIComponent

export async function getDashboardData() {
  const companyId = localStorage.getItem('companyId')
  const data = await api(`/getInitialDashboard?companyId=${e(companyId)}`)
  return { notifications: data.notifications || [], alertSensors: data.alertSensors || [] }
}

export async function getDashboardReadings() {
  const { notifications } = await getDashboardData()
  return notifications
}

export async function getPlotData(sensorId) {
  const companyId = localStorage.getItem('companyId')
  const data = await api(`/refreshOneInitialPlot?sensorId=${e(sensorId)}&companyId=${e(companyId)}`)
  return { ranges: data.ranges || [], pointsToPlot: data.pointsToPlot || [] }
}

export async function getSensorDashboard(sensorId, startDate, endDate) {
  const companyId = localStorage.getItem('companyId')
  const data = await api(
    `/sensorDashboard?sensorId=${e(sensorId)}&companyId=${e(companyId)}&startDate=${e(startDate)}&endDate=${e(endDate)}`
  )
  return { sensorData: data.sensorData || [], plotData: data.plotData || null }
}
