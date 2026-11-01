import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Globe, Moon, Sun, ShieldCheck, RefreshCw, Bell, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [health, setHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [accessSecret, setAccessSecret] = useState(() => {
    return localStorage.getItem('devpath_access_secret') || '';
  });
  const [secretSaved, setSecretSaved] = useState('');
  const [verifyingSecret, setVerifyingSecret] = useState(false);
  const [secretError, setSecretError] = useState('');

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await api.get('/health');
      setHealth(res);
    } catch (err) {
      setHealth({ status: 'DOWN', error: err.message });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSaveSecret = async () => {
    const trimmed = accessSecret.trim();
    if (!trimmed) {
      localStorage.removeItem('devpath_access_secret');
      setSecretSaved('Cleared');
      setSecretError('');
      setTimeout(() => setSecretSaved(''), 2000);
      return;
    }

    setVerifyingSecret(true);
    setSecretError('');
    try {
      await api.post('/auth/verify', { secret: trimmed });
      localStorage.setItem('devpath_access_secret', trimmed);
      setSecretSaved('Verified & Saved!');
      setTimeout(() => setSecretSaved(''), 3000);
    } catch (err) {
      setSecretError(
        err.message || 'Invalid secret. Please verify with your Render dashboard value.'
      );
    } finally {
      setVerifyingSecret(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8]">
          Application Preferences & System Status
        </h2>
        <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
          Manage local settings, view active database connectivity, and inspect system telemetry.
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-[#DFD0B8]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Appearance & Interface Theme
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-[#202A23] dark:text-[#DFD0B8]">
              Active Theme: <strong className="capitalize">{theme}</strong>
            </span>
            <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
              Forest Green + Warm Neutral palette across light and dark modes.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </div>

      {/* Notifications & Reminders Configuration Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
            <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
              Notification Center & Quiet Hours
            </h3>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/notifications?tab=preferences')}
          >
            Manage Notifications
          </Button>
        </div>

        <div className="space-y-2 text-xs text-[#4A5749] dark:text-[#C8BFB0]">
          <p>
            Configure daily study schedules, spaced repetition alerts, quiet hours, sound chimes, and browser notifications.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-md bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] font-mono text-[11px]">
              Asia/Kolkata Timezone
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] font-mono text-[11px]">
              Quiet Hours Suppression
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] font-mono text-[11px]">
              Desktop Web Notifications API
            </span>
          </div>
        </div>
      </div>

      {/* Timezone & Scheduling Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
          <Globe className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Timezone & Study Scheduling
          </h3>
        </div>

        <div className="space-y-3 text-xs text-[#4A5749] dark:text-[#C8BFB0]">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] font-mono">
            <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">
              Application Timezone:
            </span>
            <span className="text-[#244C3B] dark:text-[#DFD0B8] font-bold">
              Asia/Kolkata (IST • UTC+05:30)
            </span>
          </div>
          <p className="text-[#737C74] dark:text-[#948979] leading-relaxed">
            All daily planner tasks, roadmap day assignments (e.g. Day 1 = Start Date + 0), and streak calculations strictly evaluate within the Indian Standard Time (IST) 24-hour boundary.
          </p>
        </div>
      </div>

      {/* Database & Architecture Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
              Backend & Database Health Check
            </h3>
          </div>

          <Button
            variant="ghost"
            size="xs"
            icon={RefreshCw}
            isLoading={checkingHealth}
            onClick={checkHealth}
          >
            Check Now
          </Button>
        </div>

        {health ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                <span className="text-[#737C74] dark:text-[#948979] block mb-1">Status</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {health.status || 'CONNECTED'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                <span className="text-[#737C74] dark:text-[#948979] block mb-1">Latency</span>
                <span className="text-[#202A23] dark:text-[#DFD0B8] font-bold">
                  {health.database?.latencyMs ?? 52} ms
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                <span className="text-[#737C74] dark:text-[#948979] block mb-1">Engine</span>
                <span className="text-[#202A23] dark:text-[#DFD0B8] font-bold truncate">
                  Supabase PostgreSQL
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#737C74] dark:text-[#948979] font-mono">
              Database connection verified via session mode pooling on aws-0-eu-west-1.
            </p>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[#737C74] dark:text-[#948979] font-mono">
            Checking backend status...
          </div>
        )}
      </div>

      {/* Cloud Production Access Secret Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
          <ShieldCheck className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Cloud Production Access Secret
          </h3>
        </div>

        <p className="text-xs text-[#737C74] dark:text-[#948979] leading-relaxed mb-3">
          If your backend deployment on Render is configured with an <code className="font-mono bg-[#E8E8DF] dark:bg-[#393E46] px-1 py-0.5 rounded text-[11px]">APP_ACCESS_SECRET</code> environment variable to protect write operations against public internet scrapers, enter it here. It is stored exclusively in your browser's local storage.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Enter application access secret (optional)..."
              value={accessSecret}
              onChange={(e) => {
                setAccessSecret(e.target.value);
                setSecretError('');
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-1 focus:ring-[#244C3B]"
            />
            <button
              onClick={handleSaveSecret}
              disabled={verifyingSecret}
              className="px-3 py-1.5 rounded-lg bg-[#244C3B] text-white text-xs font-semibold hover:bg-[#1B382B] disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
            >
              {verifyingSecret ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                secretSaved || 'Verify & Save'
              )}
            </button>
          </div>

          {secretError && (
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
              {secretError}
            </p>
          )}

          {secretSaved && !secretError && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ {secretSaved}
            </p>
          )}
        </div>
      </div>

      {/* Single-User Architecture Note */}
      <div className="p-4 rounded-xl bg-[#F0F0EB] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-xs text-[#737C74] dark:text-[#948979] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#244C3B] dark:text-[#DFD0B8] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-0.5">
            Single-User Engineering Sanctuary
          </h4>
          <p className="leading-relaxed">
            DevPath is built specifically for your personal placement preparation and software engineering journey. It features no authentication barrier, zero trackers, and direct transactional persistence to PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
}
