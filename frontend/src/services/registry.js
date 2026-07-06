import { api } from "./api"

export async function getDashboardReadings() {
  const companyId = localStorage.getItem('companyId')
  const data = await api(`/getDashboard?companyId=${companyId}`)
  return data.data
}

export async function getPlotData(sensorId) {
  const data = await api(`/getDataForPlot?sensorId=${sensorId}`)
  return data.data
}
