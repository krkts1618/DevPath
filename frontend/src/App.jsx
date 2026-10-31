import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/layout/AppLayout';

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

// Sleek fallback loader during chunk fetch
function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-400/20 dark:border-t-indigo-400" />
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
        Loading view...
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
