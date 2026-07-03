import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OrganizerProvider, useOrganizerContext } from './context/OrganizerContext';
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

const OrganizerAppContent: React.FC = () => {
  const { organizer, loading } = useOrganizerContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
        <p className="font-label-bold text-on-surface-variant">AUTHENTICATING ORGANIZER...</p>
      </div>
    );
  }

  if (!organizer) {
    return <Navigate to="/login" replace />;
  }

  return (
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
  );
};

const OrganizerApp: React.FC = () => (
  <OrganizerProvider>
    <OrganizerAppContent />
  </OrganizerProvider>
);

export default OrganizerApp;
