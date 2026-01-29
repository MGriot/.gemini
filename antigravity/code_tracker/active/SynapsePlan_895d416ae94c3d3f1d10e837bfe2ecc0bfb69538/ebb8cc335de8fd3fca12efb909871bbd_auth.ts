­import api from './api';

export const login = async (email: string, password: string) => {
  try {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.access_token) {
      return { success: true, token: response.data.access_token };
    }
    return { success: false };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false };
  }
};

export const register = async (email: string, password: string, name?: string, surname?: string, nickname?: string) => {
  try {
    const response = await api.post('/auth/register', { email, password, name, surname, nickname });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/users/me/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};
­"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Qfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/services/auth.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan