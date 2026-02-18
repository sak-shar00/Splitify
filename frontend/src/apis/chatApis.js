import axiosInstance from './axios'

export const sendMessage = async (groupId, message) => {
  const response = await axiosInstance.post('/chat', { groupId, message })
  return response.data
}

export const getMessages = async (groupId, page = 1, limit = 20) => {
  const response = await axiosInstance.get(`/chat/${groupId}?page=${page}&limit=${limit}`)
  return response.data
}
