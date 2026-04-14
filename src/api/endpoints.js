const withId = (resource, id) => `/${resource}/${id}`

export const API_ENDPOINTS = {
    auth: {
        me: '/auth/me',
    },

    tasks: {
        list: '/tasks',
        create: '/tasks',
        details: (taskId) => withId('tasks', taskId),
        update: (taskId) => withId('tasks', taskId),
        remove: (taskId) => withId('tasks', taskId),
        byChefDeProjet: (chefDeProjetId) =>
            `/tasks-by-chef-de-projet/${chefDeProjetId}`,
        byStatus: (status) => `/tasks-by-status/${status}`,
        byChefDeProjetAndStatus: (chefDeProjetId, status) =>
            `/tasks-by-chef-de-projet-and-status/${chefDeProjetId}/${status}`,
        updateStatus: (taskId) => `/tasks/${taskId}/status`,
        sla: (taskId) => `/tasks/${taskId}/sla`,
        developers: (taskId) => `/tasks/${taskId}/developers`,
        developersCount: (taskId) => `/tasks/${taskId}/developers/count`,
        bulkAssignDevelopers: (taskId) => `/tasks/${taskId}/developers/bulk`,
        removeAllDevelopers: (taskId) => `/tasks/${taskId}/developers`,
    },

    developers: {
        list: '/developers',
        create: '/developers',
        details: (developerId) => withId('developers', developerId),
        update: (developerId) => withId('developers', developerId),
        remove: (developerId) => withId('developers', developerId),
        active: '/developers/active/list',
        searchByName: (name) => `/developers/search/${name}`,
        stats: (developerId) => `/developers/${developerId}/stats`,
        timeline: (developerId) => `/developers/${developerId}/timeline`,
        projects: (developerId) => `/developers/${developerId}/projects`,
        tasks: (developerId) => `/developers/${developerId}/tasks`,
        tasksByStatus: (developerId, status) =>
            `/developers/${developerId}/tasks/status/${status}`,
        tasksByRole: (developerId, role) =>
            `/developers/${developerId}/tasks/role/${role}`,
        tasksCount: (developerId) => `/developers/${developerId}/tasks/count`,
    },

    chefsDeProjet: {
        list: '/chefs-de-projet',
        create: '/chefs-de-projet',
        details: (chefId) => `/chefs-de-projet/${chefId}`,
        update: (chefId) => `/chefs-de-projet/${chefId}`,
        remove: (chefId) => `/chefs-de-projet/${chefId}`,
        active: '/chefs-de-projet/active/list',
        searchByName: (name) => `/chefs-de-projet/search/${name}`,
        projects: (chefId) => `/chefs-de-projet/${chefId}/projects`,
        tasks: (chefId) => `/chefs-de-projet/${chefId}/tasks`,
        stats: (chefId) => `/chefs-de-projet/${chefId}/stats`,
        assignProject: (chefId) => `/chefs-de-projet/${chefId}/assign-project`,
        validateTask: (chefId) => `/chefs-de-projet/${chefId}/validate-task`,
    },

    managers: {
        list: '/managers',
        create: '/managers',
        details: (managerId) => `/managers/${managerId}`,
        update: (managerId) => `/managers/${managerId}`,
        remove: (managerId) => `/managers/${managerId}`,
        search: '/managers/search',
        projects: (managerId) => `/managers/${managerId}/projects`,
        createProject: (managerId) => `/managers/${managerId}/projects`,
        projectDetails: (managerId, projectId) =>
            `/managers/${managerId}/projects/${projectId}`,
        updateProject: (managerId, projectId) =>
            `/managers/${managerId}/projects/${projectId}`,
        deleteProject: (managerId, projectId) =>
            `/managers/${managerId}/projects/${projectId}`,
        assignmentData: (managerId, projectId) =>
            `/managers/${managerId}/projects/${projectId}/assignment-data`,
        assignments: (managerId, projectId) =>
            `/managers/${managerId}/projects/${projectId}/assignments`,
        developers: (managerId) => `/managers/${managerId}/developers`,
        assignDeveloper: (managerId) => `/managers/${managerId}/developers`,
        removeDeveloper: (managerId, developerId) =>
            `/managers/${managerId}/developers/${developerId}`,
        bulkAssignDevelopers: (managerId) =>
            `/managers/${managerId}/developers/bulk`,
        chefsDeProjet: (managerId) => `/managers/${managerId}/chefs-de-projet`,
        assignChefDeProjet: (managerId) =>
            `/managers/${managerId}/chefs-de-projet`,
        removeChefDeProjet: (managerId, chefDeProjetId) =>
            `/managers/${managerId}/chefs-de-projet/${chefDeProjetId}`,
        projectsCount: (managerId) => `/managers/${managerId}/counts/projects`,
        developersCount: (managerId) => `/managers/${managerId}/counts/developers`,
        chefsCount: (managerId) => `/managers/${managerId}/counts/chefs-de-projet`,
        statistics: (managerId) => `/managers/${managerId}/statistics`,
        export: (managerId) => `/managers/${managerId}/export`,
    },

    projects: {
        list: '/projects',
        details: (projectId) => `/projects/${projectId}`,
        update: (projectId) => `/projects/${projectId}`,
        remove: (projectId) => `/projects/${projectId}`,
        tasks: (projectId) => `/projects/${projectId}/tasks`,
        developers: (projectId) => `/projects/${projectId}/developers`,
        assignmentData: (projectId) => `/projects/${projectId}/assignment-data`,
        assignments: (projectId) => `/projects/${projectId}/assignments`,
        statistics: (projectId) => `/projects/${projectId}/statistics`,
        progress: (projectId) => `/projects/${projectId}/progress`,
        timeline: (projectId) => `/projects/${projectId}/timeline`,
        sla: (projectId) => `/projects/${projectId}/sla`,
        files: (projectId) => `/projects/${projectId}/files`,
        uploadFile: (projectId) => `/projects/${projectId}/files`,
        fileDetails: (projectId, fileId) => `/projects/${projectId}/files/${fileId}`,
        downloadFile: (projectId, fileId) => `/projects/${projectId}/files/${fileId}/download`,
        removeFile: (projectId, fileId) => `/projects/${projectId}/files/${fileId}`,
        export: (projectId) => `/projects/${projectId}/export`,
        developerAssignments: (projectId) =>
            `/projects/${projectId}/developer-assignments`,
        assignDeveloper: (projectId, developerId) =>
            `/projects/${projectId}/developers/${developerId}`,
        updateDeveloperRole: (projectId, developerId) =>
            `/projects/${projectId}/developers/${developerId}`,
        removeDeveloper: (projectId, developerId) =>
            `/projects/${projectId}/developers/${developerId}`,
        developerHistory: (projectId, developerId) =>
            `/projects/${projectId}/developers/${developerId}/history`,
        bulkAssignDevelopers: (projectId) => `/projects/${projectId}/developers/bulk`,
    },

    developerTaskAssignments: {
        list: '/developer-task-assignments',
        create: '/developer-task-assignments',
        byRole: (role) => `/developer-task-assignments/role/${role}`,
        details: (developerId, taskId) =>
            `/developer-task-assignments/${developerId}/${taskId}`,
        update: (developerId, taskId) =>
            `/developer-task-assignments/${developerId}/${taskId}`,
        remove: (developerId, taskId) =>
            `/developer-task-assignments/${developerId}/${taskId}`,
        assignmentDetails: (developerId, taskId) =>
            `/developer-task-assignments/${developerId}/${taskId}/details`,
    },
}

export default API_ENDPOINTS
