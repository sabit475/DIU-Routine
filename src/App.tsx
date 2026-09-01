/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { RoutinePage } from './pages/RoutinePage';
import { AdminPage } from './pages/AdminPage';
import { WeeklySchedulePage } from './pages/WeeklySchedulePage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { RoutinePdfPage } from './pages/RoutinePdfPage';
import { RoutineProvider } from './lib/RoutineContext';

export default function App() {
  return (
    <RoutineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="routine" element={<RoutinePage />} />
            <Route path="weekly" element={<WeeklySchedulePage />} />
            <Route path="courses" element={<MyCoursesPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="pdf" element={<RoutinePdfPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoutineProvider>
  );
}
