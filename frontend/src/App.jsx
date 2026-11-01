import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/layout/AppLayout';
import AccessSecretModal from './components/common/AccessSecretModal';

// Route-level Code Splitting for optimal production bundle size and initial load speed
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DailyPlannerPage = lazy(() => import('./pages/DailyPlannerPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const MyRoadmapsPage = lazy(() => import('./pages/MyRoadmapsPage'));
const RoadmapDetailPage = lazy(() => import('./pages/RoadmapDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const RevisionSchedulePage = lazy(() => import('./pages/RevisionSchedulePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const FocusTimerPage = lazy(() => import('./pages/FocusTimerPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Sleek DevPath branded fallback loader during chunk fetch
function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-[#244C3B]/10 dark:bg-[#DFD0B8]/10 animate-ping" />
        <div className="relative w-9 h-9 rounded-xl bg-[#244C3B] dark:bg-[#DFD0B8] flex items-center justify-center shadow-xs">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-5 h-5 text-[#DFD0B8] dark:text-[#222831]"
          >
            <path
              d="M6 23L12 17L18 20L25 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 9H25V14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="6" cy="23" r="2.2" fill="#10B981" />
            <circle cx="25" cy="9" r="2.5" fill="#10B981" />
          </svg>
        </div>
      </div>
      <span className="text-xs font-mono font-medium text-[#737C74] dark:text-[#948979] tracking-wider uppercase">
        Loading DevPath...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AccessSecretModal />
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="planner"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <DailyPlannerPage />
                    </Suspense>
                  }
                />
                <Route
                  path="focus"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <FocusTimerPage />
                    </Suspense>
                  }
                />
                <Route
                  path="calendar"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <CalendarPage />
                    </Suspense>
                  }
                />
                <Route
                  path="roadmaps"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <MyRoadmapsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="roadmaps/:id"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <RoadmapDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <AnalyticsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="notes"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <NotesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="revision"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <RevisionSchedulePage />
                    </Suspense>
                  }
                />
                <Route
                  path="projects"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <ProjectsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <NotificationsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <SettingsPage />
                    </Suspense>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </TimerProvider>
    </ThemeProvider>
  );
}
