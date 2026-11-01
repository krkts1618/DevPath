import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

export default function AccessSecretModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [callbacks, setCallbacks] = useState(null);

  useEffect(() => {
    const handleSecretNeeded = (e) => {
      const { onSuccess, onCancel } = e.detail || {};
      setCallbacks({ onSuccess, onCancel });
      setErrorMessage('');
      setSuccessMessage('');
      setSecretInput(localStorage.getItem('devpath_access_secret') || '');
      setIsOpen(true);
    };

    const handleOpenModal = () => {
      setCallbacks(null);
      setErrorMessage('');
      setSuccessMessage('');
      setSecretInput(localStorage.getItem('devpath_access_secret') || '');
      setIsOpen(true);
    };

    window.addEventListener('devpath:access-secret-needed', handleSecretNeeded);
    window.addEventListener('devpath:open-secret-modal', handleOpenModal);

    return () => {
      window.removeEventListener('devpath:access-secret-needed', handleSecretNeeded);
      window.removeEventListener('devpath:open-secret-modal', handleOpenModal);
    };
  }, []);

  const handleClose = () => {
    if (callbacks?.onCancel) {
      callbacks.onCancel();
    }
    setIsOpen(false);
    setCallbacks(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSaveAndUnlock = async (e) => {
    e.preventDefault();
    const trimmed = secretInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an application access secret.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Verify with backend before persisting
      const res = await api.post('/auth/verify', { secret: trimmed });
      
      // Save to localStorage
      localStorage.setItem('devpath_access_secret', trimmed);
      setSuccessMessage('Secret verified! Unlocking workspace...');

      setTimeout(() => {
        if (callbacks?.onSuccess) {
          callbacks.onSuccess(trimmed);
        }
        setIsOpen(false);
        setCallbacks(null);
        setLoading(false);
      }, 400);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      setErrorMessage(
        msg.includes('Invalid')
          ? 'Incorrect access secret. Please verify the APP_ACCESS_SECRET value in your Render dashboard.'
          : msg
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E8DF] dark:border-[#393E46] bg-[#F7F7F2] dark:bg-[#222831]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#244C3B]/10 dark:bg-[#DFD0B8]/10 text-[#244C3B] dark:text-[#DFD0B8]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8]">
                Application Access Secret Required
              </h3>
              <p className="text-[11px] text-[#737C74] dark:text-[#948979]">
                Single-User Production Protection
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#E8E8DF] dark:hover:bg-[#393E46] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveAndUnlock} className="p-5 space-y-4">
          <p className="text-xs text-[#737C74] dark:text-[#948979] leading-relaxed">
            This write operation requires your backend application access secret. It protects your personal DevPath deployment on Render from public internet scrapers.
          </p>

          <div className="p-3 rounded-xl bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[11px] text-[#4A5749] dark:text-[#DFD0B8] space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
              Where to find your secret:
            </div>
            <p className="text-[#737C74] dark:text-[#948979] leading-normal">
              In your <strong>Render Dashboard</strong> → <strong>devpath-api</strong> service → <strong>Environment</strong> tab → copy the value of <code className="font-mono px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">APP_ACCESS_SECRET</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1.5">
              Access Secret Passphrase
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={secretInput}
                onChange={(e) => {
                  setSecretInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Paste or enter APP_ACCESS_SECRET..."
                autoFocus
                className="w-full pl-3 pr-10 py-2 text-xs rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8DF] dark:border-[#393E46]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#737C74] dark:text-[#948979] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !secretInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244C3B] hover:bg-[#1B382B] text-white disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock & Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
