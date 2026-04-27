import axiosClient from '../api/axiosClient.js'
import API_ENDPOINTS from '../api/endpoints.js'
import { APP_ROLES } from '../auth/roles.js'

function getProjectsCollection(payload) {
    if (Array.isArray(payload)) {
        return payload
    }

    if (Array.isArray(payload?.projects)) {
        return payload.projects
    }

    if (Array.isArray(payload?.data)) {
        return payload.data
    }

    return []
}

export async function getProjects(options = {}) {
    const { actorIds = {}, currentRole = '' } = options

    let response

    if (currentRole === APP_ROLES.MANAGER && actorIds.manager) {
        response = await axiosClient.get(API_ENDPOINTS.managers.projects(actorIds.manager))
        return getProjectsCollection(response.data)
    }

    if (currentRole === APP_ROLES.CHEF_DE_PROJET && actorIds.chef_de_projet) {
        response = await axiosClient.get(
            API_ENDPOINTS.chefsDeProjet.projects(actorIds.chef_de_projet),
        )
        return getProjectsCollection(response.data)
    }

    if (currentRole === APP_ROLES.DEVELOPER && actorIds.developer) {
        response = await axiosClient.get(API_ENDPOINTS.developers.projects(actorIds.developer))
        return getProjectsCollection(response.data)
    }

    response = await axiosClient.get(API_ENDPOINTS.projects.list)
    return getProjectsCollection(response.data)
}

export async function getProject(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.details(projectId))
    return response.data
}

export async function getProjectDetails(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.details(projectId))
    return response.data
}

export async function createProject(managerId, payload) {
    const response = await axiosClient.post(
        API_ENDPOINTS.managers.createProject(managerId),
        payload,
    )
    return response.data
}

export async function updateProject(projectId, payload) {
    const response = await axiosClient.patch(
        API_ENDPOINTS.projects.update(projectId),
        payload,
    )
    return response.data
}

export async function getProjectProgress(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.progress(projectId))
    return response.data
}

export async function getProjectFiles(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.files(projectId))
    return response.data
}

export async function uploadProjectFile(projectId, file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post(
        API_ENDPOINTS.projects.uploadFile(projectId),
        formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    )

    return response.data
}

export async function deleteProjectFile(projectId, fileId) {
    const response = await axiosClient.delete(
        API_ENDPOINTS.projects.removeFile(projectId, fileId),
    )

    return response.data
}

export async function viewProjectFile(projectId, fileId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.projects.fileDetails(projectId, fileId), {
            responseType: 'blob',
        },
    )

    return response.data
}

export async function downloadProjectFile(projectId, fileId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.projects.downloadFile(projectId, fileId), {
            responseType: 'blob',
        },
    )

    return response.data
}

export async function getProjectSla(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.sla(projectId))
    return response.data
}

export async function updateProjectSla(projectId, payload) {
    const response = await axiosClient.patch(
        API_ENDPOINTS.projects.sla(projectId),
        payload,
    )
    return response.data
}

export async function getProjectTasks(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.tasks(projectId))
    return response.data
}

export async function getProjectDevelopers(projectId) {
    const response = await axiosClient.get(API_ENDPOINTS.projects.developers(projectId))
    return response.data
}

export async function getAssignmentData(projectId) {
    const response = await axiosClient.get(
        API_ENDPOINTS.projects.assignmentData(projectId)
    )
    return response.data
}

export async function saveAssignments(projectId, payload) {
    const response = await axiosClient.post(
        API_ENDPOINTS.projects.assignments(projectId),
        payload
    )
    return response.data
}
