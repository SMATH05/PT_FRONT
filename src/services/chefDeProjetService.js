import axiosClient from '../api/axiosClient.js'
import API_ENDPOINTS from '../api/endpoints.js'

export async function getChefsDeProjet() {
  const response = await axiosClient.get(API_ENDPOINTS.chefsDeProjet.list)
  return response.data
}

export async function getChefDeProjet(chefId) {
  const response = await axiosClient.get(API_ENDPOINTS.chefsDeProjet.details(chefId))
  return response.data
}

export async function createChefDeProjet(payload) {
  const response = await axiosClient.post(
    API_ENDPOINTS.chefsDeProjet.create,
    payload,
  )
  return response.data
}

export async function updateChefDeProjet(chefId, payload) {
  const response = await axiosClient.patch(
    API_ENDPOINTS.chefsDeProjet.update(chefId),
    payload,
  )
  return response.data
}
