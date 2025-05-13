// services/api.ts
import axios from 'axios';

const DEFAULT_TOKEN = '575a101fd4fcdc8dbcd070e188cf0fe52353fbad0612572ae82f4701a891181b';
const PAYMENT_TOKEN = '7d06f4e56d3646f6f039af95598351f7a78fa52736536c645d3a62a9fd1710b5';

// Cliente padrão
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${DEFAULT_TOKEN}`;
  return config;
});

const hwidApi = axios.create({
  baseURL: 'http://localhost:3000/fetchhwid',
  headers: {
    'Content-Type': 'application/json',
  }
});

hwidApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});


const resetApi = axios.create({
  baseURL: 'http://localhost:3000/reset',
  headers: {
    'Content-Type': 'application/json',
  }
});

resetApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});


// Cliente para pagamentos
const paymentApi = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

paymentApi.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${PAYMENT_TOKEN}`;
  return config;
});

export { api, paymentApi, hwidApi, resetApi };
