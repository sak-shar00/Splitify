import axios from './axios';

export const getNotifications = async () => {
  const response = await axios.get('/notifications');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await axios.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.patch('/notifications/mark-all-read');
  return response.data;
};

export const respondToInvite = async (notificationId, action) => {
  const response = await axios.post('/groups/invite/respond', {
    notificationId,
    action
  });
  return response.data;
};
