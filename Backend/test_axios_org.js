const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer festflow-staff-organizer`;
  return config;
});

API.interceptors.response.use((response) => {
  if (response.data && response.data.success && response.data.data !== undefined) {
    response.data = response.data.data;
  }
  return response;
});

API.get('/organizer/events', { params: { search: '' } })
  .then((r) => {
    console.log("Is array?", Array.isArray(r.data));
    console.log("Length:", r.data.length);
    console.log("First item:", r.data[0]);
    const mapped = r.data.map((e) => ({ ...e, location: e.venue || e.location, time: e.startTime || e.time, imageUrl: e.bannerImage || e.imageUrl, registrationsCount: e.registrationCount ?? e.registrationsCount ?? 0, rsvps: e.registrationCount ?? e.registrationsCount ?? 0 }));
    console.log("Mapped length:", mapped.length);
  })
  .catch(err => {
    console.error(err);
  });
