import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', {
    username: data.username,
    password: data.password,
    email: data.email
  }),
  login: (data) => api.post('/api/auth/login', {
    username: data.username,
    password: data.password
  }),
};

// Documents API
export const documentsAPI = {
  getAll: () => api.get('/api/documents'),
  getById: (id) => api.get(`/api/documents/${id}`),
  upload: (formData) => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadBatch: (formData) => api.post('/api/documents/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: (id) => api.post(`/api/documents/${id}/analyze`),
  delete: (id) => api.delete(`/api/documents/${id}`),
  addTags: (id, tagIds) => api.post(`/api/documents/${id}/tags`, tagIds),
  getByCategory: (categoryId) => api.get('/api/documents', { params: { categoryId } }),
  getByTag: (tagId) => api.get('/api/documents', { params: { tagId } }),
  search: (query) => api.get('/api/documents', { params: { search: query } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  create: (name) => api.post('/api/categories', { name }),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/api/tags'),
  create: (name) => api.post('/api/tags', { name }),
};

export default api;