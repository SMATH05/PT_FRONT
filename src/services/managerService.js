import axiosClient from '../api/axiosClient.js'
import API_ENDPOINTS from '../api/endpoints.js'

export async function getManagers() {
    const response = await axiosClient.get(API_ENDPOINTS.managers.list)
    return response.data
}

export async function getManager(managerId) {
    const response = await axiosClient.get(API_ENDPOINTS.managers.details(managerId))
    return response.data
}

export async function createManager(payload) {
    const response = await axiosClient.post(API_ENDPOINTS.managers.create, payload)
    return response.data
}

export async function updateManager(managerId, payload) {
    const response = await axiosClient.patch(
        API_ENDPOINTS.managers.update(managerId),
        payload,
    )
    return response.data
}

export async function getManagerProjects(managerId) {
    const response = await axiosClient.get(API_ENDPOINTS.managers.projects(managerId))
    return response.data
}

export async function createManagerProject(managerId, payload) {
    const response = await axiosClient.post(
        API_ENDPOINTS.managers.createProject(managerId),
        payload
    )
    return response.data
}

export async function getManagerProjectDetails(managerId, projectId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.managers.projectDetails(managerId, projectId)
    )
    return response.data
}

export async function updateManagerProject(managerId, projectId, payload) {
    const response = await axiosClient.patch(
        API_ENDPOINTS.managers.updateProject(managerId, projectId),
        payload
    )
    return response.data
}

export async function deleteManagerProject(managerId, projectId) {
    const response = await axiosClient.delete(
        API_ENDPOINTS.managers.deleteProject(managerId, projectId)
    )
    return response.data
}

export async function getAssignmentData(managerId, projectId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.managers.assignmentData(managerId, projectId)
    )
    return response.data
}

export async function saveAssignments(managerId, projectId, payload) {
    const response = await axiosClient.post(
        API_ENDPOINTS.managers.assignments(managerId, projectId),
        payload
    )
    return response.data
}

export async function getManagerDevelopers(managerId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.managers.developers(managerId)
    )
    return response.data
}

export async function getManagerChefs(managerId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.managers.chefsDeProjet(managerId)
    )
    return response.data
}