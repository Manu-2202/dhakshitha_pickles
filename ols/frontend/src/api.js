import axios from 'axios';
import { filterMockPickles, getMockPickleById } from './mockData';

// Dynamic API URL: Detects if running locally or on production
const isLocal = window.location.hostname === 'localhost';

export const API_URL = isLocal 
  ? 'http://localhost:5000' 
  : 'https://dakshitha-pickles.onrender.com';

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function isMockId(id) {
  return typeof id === 'string' && id.startsWith('mock-');
}

export const PicklesAPI = {
  getAll: async (params = {}) => {
    try {
      const res = await API.get('/pickles', { params });
      return res.data;
    } catch {
      const { category, bestseller } = params;
      return filterMockPickles({ category, bestseller });
    }
  },
  getById: async (id) => {
    if (isMockId(id)) return getMockPickleById(id);
    try {
      const res = await API.get(`/pickles/${id}`);
      return res.data;
    } catch {
      return getMockPickleById(id) || null;
    }
  },
  create: async (formData) => {
    const res = await API.post('/pickles', formData);
    return res.data;
  },
  update: async (id, formData) => {
    const res = await API.put(`/pickles/${id}`, formData);
    return res.data;
  },
  delete: async (id) => {
    const res = await API.delete(`/pickles/${id}`);
    return res.data;
  },
};

export const OrdersAPI = {
  getAll: async () => {
    const res = await API.get('/orders');
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await API.put(`/orders/${id}/status`, { status });
    return res.data;
  },
};

export const CouponsAPI = {
  getAll: async () => {
    const res = await API.get('/coupons');
    return res.data;
  },
  create: async (data) => {
    const res = await API.post('/coupons', data);
    return res.data;
  },
  delete: async (id) => {
    const res = await API.delete(`/coupons/${id}`);
    return res.data;
  },
  apply: async (code) => {
    const res = await API.post('/coupons/apply', { code });
    return res.data;
  },
};

export default API;
