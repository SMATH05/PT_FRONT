import axiosClient from '../api/axiosClient.js'
import API_ENDPOINTS from '../api/endpoints.js'

export async function getTasks() {
    const response = await axiosClient.get(API_ENDPOINTS.tasks.list)
    return response.data
}

export async function getTask(taskId) {
    const response = await axiosClient.get(API_ENDPOINTS.tasks.details(taskId))
    return response.data
}

export async function createTask(payload) {
    const response = await axiosClient.post(API_ENDPOINTS.tasks.create, payload)
    return response.data
}

export async function updateTask(taskId, payload) {
    const response = await axiosClient.patch(API_ENDPOINTS.tasks.update(taskId), payload)
    return response.data
}

export async function getTaskSla(taskId) {
    const response = await axiosClient.get(API_ENDPOINTS.tasks.sla(taskId))
    return response.data
}

export async function updateTaskSla(taskId, payload) {
    const response = await axiosClient.patch(API_ENDPOINTS.tasks.sla(taskId), payload)
    return response.data
}

export async function getTaskDevelopers(taskId) {
    const response = await axiosClient.get(API_ENDPOINTS.tasks.developers(taskId))
    return response.data
}

export async function bulkAssignTaskDevelopers(taskId, payload) {
    const response = await axiosClient.post(
        API_ENDPOINTS.tasks.bulkAssignDevelopers(taskId),
        payload,
    )
    return response.data
}

export async function removeAllTaskDevelopers(taskId) {
    const response = await axiosClient.delete(
        API_ENDPOINTS.tasks.removeAllDevelopers(taskId),
    )
    return response.data
}