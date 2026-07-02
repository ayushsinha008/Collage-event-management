import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentApp from './App.tsx';
import OrganizerApp from './OrganizerApp.tsx';
import VolunteerApp from './VolunteerApp.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/organizer/*" element={<OrganizerApp />} />
        <Route path="/volunteer/*" element={<VolunteerApp />} />
        <Route path="/*" element={<StudentApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
