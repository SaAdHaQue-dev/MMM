import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ExpensesPage } from '@/pages/expenses/ExpensesPage';
import { TasksEventsPage } from '@/pages/tasks-events/TasksEventsPage';
import { FamilyPage } from '@/pages/family/FamilyPage';
import { GuestsPage } from '@/pages/guests/GuestsPage';
import { InvitationEditorPage } from '@/pages/invitation/InvitationEditorPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { SetupPage } from '@/pages/auth/SetupPage';
import { PublicInvitePage } from '@/pages/public/PublicInvitePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/setup" element={<SetupPage />} />

      {/* Public Digital Invitation with RSVP */}
      <Route path="/invite/:slug" element={<PublicInvitePage />} />

      {/* Protected Dashboard Workspace Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/tasks-events" element={<TasksEventsPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/invitation/editor" element={<InvitationEditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
