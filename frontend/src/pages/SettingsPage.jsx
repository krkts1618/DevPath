import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Bell,
  BookOpen,
  Timer,
  Sliders,
  ShieldCheck,
  Database,
  RefreshCw,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { useTheme, ACCENT_COLORS } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');

  // Daily target state
  const [dailyTarget, setDailyTarget] = useState(() => {
    return parseInt(localStorage.getItem('devpath_daily_target') || '5', 10);
  });

  // Health and Secret diagnostics
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

  const handleAdjustTarget = (delta) => {
    const newVal = Math.max(1, Math.min(25, dailyTarget + delta));
    setDailyTarget(newVal);
    localStorage.setItem('devpath_daily_target', newVal.toString());
  };

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

  const settingsTabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'others', label: 'Others', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="pb-4 border-b border-[var(--border-subtle)]">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Workspace visual themes, notification intervals, and database telemetry
        </p>
      </div>

      {/* 2. Two-Pane Layout Matching Reference Screen 10 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side Navigation (approx 3 cols) */}
        <div className="md:col-span-3 space-y-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-2.5 shadow-xs">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Pane (approx 9 cols) */}
        <div className="md:col-span-9 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xs">
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              {/* Choose Theme Section */}
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Appearance
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">
                  Choose your theme
                </p>

                {/* 3 Visual Preview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Dark Theme Card */}
                  <div
                    onClick={() => setTheme('dark')}
                    className={`rounded-2xl p-3 border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                      theme === 'dark'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-elevated)] shadow-md'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[#171B21]'
                    }`}
                  >
                    <div className="h-20 w-full rounded-xl bg-[#12151A] border border-[#252C35] p-2 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#252C35] pb-1">
                        <div className="w-10 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        <div className="w-3 h-1.5 rounded-full bg-[#303945]" />
                      </div>
                      <div className="space-y-1">
                        <div className="w-3/4 h-1 rounded-full bg-[#252C35]" />
                        <div className="w-1/2 h-1 rounded-full bg-[#252C35]" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-center text-[#F3F4F6]">
                      Dark
                    </span>
                  </div>

                  {/* Light Theme Card */}
                  <div
                    onClick={() => setTheme('light')}
                    className={`rounded-2xl p-3 border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                      theme === 'light'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-elevated)] shadow-md'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[#F4F5F2]'
                    }`}
                  >
                    <div className="h-20 w-full rounded-xl bg-[#FFFFFF] border border-[#E4E7E0] p-2 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#E4E7E0] pb-1">
                        <div className="w-10 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        <div className="w-3 h-1.5 rounded-full bg-[#D5DBD1]" />
                      </div>
                      <div className="space-y-1">
                        <div className="w-3/4 h-1 rounded-full bg-[#E4E7E0]" />
                        <div className="w-1/2 h-1 rounded-full bg-[#E4E7E0]" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-center text-[#202620]">
                      Light
                    </span>
                  </div>

                  {/* System Theme Card */}
                  <div
                    onClick={() => setTheme('system')}
                    className={`rounded-2xl p-3 border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                      theme === 'system'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-elevated)] shadow-md'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="h-20 w-full rounded-xl border border-[var(--border-subtle)] flex overflow-hidden">
                      <div className="w-1/2 bg-[#12151A] p-2 border-r border-[#252C35]">
                        <div className="w-6 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      </div>
                      <div className="w-1/2 bg-[#FFFFFF] p-2">
                        <div className="w-6 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-center text-[var(--text-primary)]">
                      System
                    </span>
                  </div>
                </div>
              </div>

              {/* Accent Color Swatches */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-secondary)] font-semibold block mb-3">
                  Accent Color
                </span>
                <div className="flex items-center gap-3">
                  {Object.entries(ACCENT_COLORS).map(([key, config]) => {
                    const isSelected = accentColor === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setAccentColor(key)}
                        title={config.label}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-surface)] scale-110'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: config.swatch || config.dark }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Learning Target Stepper */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-primary)] block">
                    Daily Learning Target
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Target tasks to complete each calendar day
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustTarget(-1)}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-bold text-[var(--text-primary)] w-8 text-center">
                    {dailyTarget}
                  </span>
                  <button
                    onClick={() => handleAdjustTarget(1)}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Notifications & Reminders
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Configure reminder schedules, quiet hours, and daily digest chimes.
              </p>
              <Button
                variant="amber"
                size="sm"
                onClick={() => navigate('/notifications')}
              >
                Open Notification Center
              </Button>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Curriculum & Spaced Retention
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Manage learning schedules, active frontiers, and review cadence.
              </p>
              <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                Timezone: <strong className="text-[var(--text-primary)]">Asia/Kolkata (IST • UTC+05:30)</strong>
              </div>
            </div>
          )}

          {activeTab === 'timer' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Focus Timer Presets
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Manage Pomodoro intervals, short break durations, and audio chime frequencies.
              </p>
              <Button
                variant="amber"
                size="sm"
                onClick={() => navigate('/focus')}
              >
                Open Focus Timer
              </Button>
            </div>
          )}

          {activeTab === 'others' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  System Diagnostics & Telemetry
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Backend health status and Supabase PostgreSQL connection
                </p>
              </div>

              {/* Health check */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Supabase PostgreSQL Connection
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {health?.status || 'CONNECTED'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)]">
                  Host: aws-0-eu-west-1.pooler.supabase.com • Latency: {health?.database?.latencyMs ?? 48}ms
                </div>
              </div>

              {/* Access Secret */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                <span className="text-xs font-semibold text-[var(--text-primary)] block">
                  Application Access Secret
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter access secret..."
                    value={accessSecret}
                    onChange={(e) => setAccessSecret(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none"
                  />
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={handleSaveSecret}
                    disabled={verifyingSecret}
                  >
                    {verifyingSecret ? 'Verifying...' : secretSaved || 'Save Secret'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
