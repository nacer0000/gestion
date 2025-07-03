import axios from 'axios';

const API_BASE_URL = 'http://localhost/stockpro/backend/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login.php', { email, password }),
  logout: () => api.post('/auth/logout.php'),
  verify: () => api.get('/auth/verify.php'),
};

export const usersAPI = {
  getAll: () => api.get('/users/index.php'),
  create: (userData: any) => api.post('/users/index.php', userData),
  update: (userData: any) => api.put('/users/index.php', userData),
  delete: (id: string) => api.delete('/users/index.php', { data: { id } }),
};

export const produitsAPI = {
  getAll: () => api.get('/produits/index.php'),
  create: (produitData: any) => api.post('/produits/index.php', produitData),
  update: (produitData: any) => api.put('/produits/index.php', produitData),
  delete: (id: string) => api.delete('/produits/index.php', { data: { id } }),
};

export const magasinsAPI = {
  getAll: () => api.get('/magasins/index.php'),
  create: (magasinData: any) => api.post('/magasins/index.php', magasinData),
  update: (magasinData: any) => api.put('/magasins/index.php', magasinData),
  delete: (id: string) => api.delete('/magasins/index.php', { data: { id } }),
};

export const fournisseursAPI = {
  getAll: () => api.get('/fournisseurs/index.php'),
  create: (fournisseurData: any) => api.post('/fournisseurs/index.php', fournisseurData),
  update: (fournisseurData: any) => api.put('/fournisseurs/index.php', fournisseurData),
  delete: (id: string) => api.delete('/fournisseurs/index.php', { data: { id } }),
};

export const stocksAPI = {
  getAll: () => api.get('/stocks/index.php'),
  getByMagasin: (magasinId: string) => api.get(`/stocks/index.php?magasin_id=${magasinId}`),
  create: (stockData: any) => api.post('/stocks/index.php', stockData),
  update: (stockData: any) => api.put('/stocks/index.php', stockData),
  delete: (id: string) => api.delete('/stocks/index.php', { data: { id } }),
};

export const mouvementsAPI = {
  getAll: () => api.get('/mouvements/index.php'),
  create: (mouvementData: any) => api.post('/mouvements/index.php', mouvementData),
};

export const presencesAPI = {
  getAll: () => api.get('/presences/index.php'),
  getByUser: (userId: string) => api.get(`/presences/index.php?user_id=${userId}`),
  create: (presenceData: any) => api.post('/presences/index.php', presenceData),
};