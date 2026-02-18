import axiosInstance from './axios'

export const createSettlement = async (settlementData) => {
  const response = await axiosInstance.post('/settlements', settlementData)
  return response.data
}

export const getSettlementsByGroup = async (groupId) => {
  const response = await axiosInstance.get(`/settlements/group/${groupId}`)
  return response.data
}

export const getSettlementById = async (settlementId) => {
  const response = await axiosInstance.get(`/settlements/${settlementId}`)
  return response.data
}

export const completeSettlement = async (settlementId) => {
  const response = await axiosInstance.patch(`/settlements/${settlementId}/complete`)
  return response.data
}
