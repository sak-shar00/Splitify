import axiosInstance from './axios'

export const createExpense = async (expenseData) => {
  const response = await axiosInstance.post('/expenses', expenseData)
  return response.data
}

export const getExpensesByGroup = async (groupId) => {
  const response = await axiosInstance.get(`/expenses/group/${groupId}`)
  return response.data
}

export const getGroupBalances = async (groupId) => {
  const response = await axiosInstance.get(`/expenses/group/${groupId}/balances`)
  return response.data
}

export const deleteExpense = async (expenseId) => {
  const response = await axiosInstance.delete(`/expenses/${expenseId}`)
  return response.data
}

export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/expenses/dashboard/stats')
  return response.data
}
