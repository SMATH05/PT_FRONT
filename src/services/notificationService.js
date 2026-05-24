import axiosClient from '../api/axiosClient.js'

export const getNotifications = () => axiosClient.get('/notifications')

export const markAsRead = (id) => axiosClient.post(`/notifications/${id}/read`)

export const markAllAsRead = () => axiosClient.post('/notifications/read-all')
