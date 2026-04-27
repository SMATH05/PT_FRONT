import axiosClient from '../api/axiosClient.js'
import API_ENDPOINTS from '../api/endpoints.js'

export async function getDevelopers() {
    const response = await axiosClient.get(API_ENDPOINTS.developers.list)
    return response.data
}

export async function getDeveloper(developerId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.developers.details(developerId),
    )
    return response.data
}

export async function createDeveloper(payload) {
    const response = await axiosClient.post(API_ENDPOINTS.developers.create, payload)
    return response.data
}

export async function updateDeveloper(developerId, payload) {
    const response = await axiosClient.patch(
        API_ENDPOINTS.developers.update(developerId),
        payload,
    )
    return response.data
}