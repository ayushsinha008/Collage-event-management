import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OrganizerProvider } from './context/OrganizerContext';
import { OrganizerLayout } from './components/organizer/layout/OrganizerLayout';
import { DashboardPage } from './pages/organizer/DashboardPage';
import { MyEventsPage } from './pages/organizer/MyEventsPage';
import { CreateEventPage } from './pages/organizer/CreateEventPage';
import { ManageEventPage } from './pages/organizer/ManageEventPage';
import { VolunteersPage } from './pages/organizer/VolunteersPage';
import { RegistrationsPage } from './pages/organizer/RegistrationsPage';
import { AnalyticsPage } from './pages/organizer/AnalyticsPage';
import { AnnouncementsPage } from './pages/organizer/AnnouncementsPage';
import { ProfilePage } from './pages/organizer/ProfilePage';
import { SettingsPage } from './pages/organizer/SettingsPage';

const App: React.FC = () => (
  <OrganizerProvider>
    <OrganizerLayout>
      <Routes>
        <Route path="/"             element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="events"        element={<MyEventsPage />} />
        <Route path="events/new"    element={<CreateEventPage />} />
        <Route path="events/:id"    element={<ManageEventPage />} />
        <Route path="volunteers"    element={<VolunteersPage />} />
        <Route path="registrations" element={<RegistrationsPage />} />
        <Route path="analytics"     element={<AnalyticsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="settings"      element={<SettingsPage />} />
        <Route path="profile"       element={<ProfilePage />} />
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Routes>
    </OrganizerLayout>
  </OrganizerProvider>
);

export default App;