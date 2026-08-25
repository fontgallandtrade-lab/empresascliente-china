import axios from 'axios';

export const API_URL = 'https://api.taturanaexpress.com.br/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});
