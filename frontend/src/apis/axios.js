import axios from 'axios';
import { getCookie } from '../utils/cookies';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL.startsWith('http') 
    ? import.meta.env.VITE_API_URL 
    : `https://${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;