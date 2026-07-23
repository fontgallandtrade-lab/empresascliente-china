import axios from 'axios';

export const API_URL = 'http://2.24.69.240:3020/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
