import axiosClient from '../api/axiosClient.js'
import API_ENDPOINTS from '../api/endpoints.js'

export async function checkAuth() {
    const response = await axiosClient.get(API_ENDPOINTS.auth.me)
    return response.data
}

export function getProfile() {
    return axiosClient.get(API_ENDPOINTS.auth.me).then(res => res.data)
}