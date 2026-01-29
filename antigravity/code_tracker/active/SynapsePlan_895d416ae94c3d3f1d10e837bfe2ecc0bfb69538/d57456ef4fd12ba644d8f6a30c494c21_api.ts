¯import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
¯"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Pfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/services/api.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan