import axiosInstance from './axios'

export const createGroup = async (groupData) => {
  const response = await axiosInstance.post('/groups', groupData)
  return response.data
}

export const getAllGroups = async () => {
  const response = await axiosInstance.get('/groups')
  return response.data
}

export const getGroupById = async (id) => {
  const response = await axiosInstance.get(`/groups/${id}`)
  return response.data
}

export const inviteMember = async (groupId, username) => {
  const response = await axiosInstance.post(`/groups/${groupId}/invite`, { username })
  return response.data
}

export const respondToInvite = async (notificationId, action) => {
  const response = await axiosInstance.post('/groups/invite/respond', { notificationId, action })
  return response.data
}

export const removeMember = async (groupId, memberId) => {
  const response = await axiosInstance.delete(`/groups/${groupId}/member`, { data: { memberId } })
  return response.data
}

export const deleteGroup = async (groupId) => {
  const response = await axiosInstance.delete(`/groups/${groupId}`)
  return response.data
}
