const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer festflow-staff-organizer`;
  return config;
});

API.get('/organizer/dashboard')
  .then(res => console.log('Success:', res.status, res.data))
  .catch(err => {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
  });
