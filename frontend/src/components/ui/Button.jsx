import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer select-none';

  const variants = {
    primary:
      'bg-[var(--accent-primary)] hover:brightness-105 active:brightness-95 text-[var(--accent-text)] font-semibold shadow-xs focus-visible:ring-[var(--accent-primary)]',
    amber:
      'bg-[#F2A93B] hover:bg-[#FFB84D] active:bg-[#D98B20] text-[#12151A] font-semibold shadow-xs focus-visible:ring-[#F2A93B]',
    secondary:
      'bg-[#F0F2ED] hover:bg-[#E4E7E0] active:bg-[#D5DBD1] text-[#202620] border border-[#E4E7E0] focus-visible:ring-[#C77B16] dark:bg-[#252C35] dark:hover:bg-[#2B333D] dark:active:bg-[#1D232B] dark:text-[#F3F4F6] dark:border-[#303945] dark:focus-visible:ring-[#F2A93B]',
    outline:
      'border border-[#D5DBD1] bg-transparent hover:bg-[#F0F2ED] text-[#202620] focus-visible:ring-[#C77B16] dark:border-[#3A4552] dark:hover:bg-[#252C35] dark:text-[#F3F4F6] dark:focus-visible:ring-[#F2A93B]',
    ghost:
      'bg-transparent hover:bg-[#F0F2ED] text-[#596258] hover:text-[#202620] focus-visible:ring-[#C77B16] dark:hover:bg-[#252C35] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] dark:focus-visible:ring-[#F2A93B]',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-xs focus-visible:ring-rose-500',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-xs focus-visible:ring-emerald-500',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg font-medium',
    sm: 'px-4 py-2 text-xs font-semibold gap-2 rounded-xl shadow-xs',
    md: 'px-5 py-2.5 text-xs sm:text-sm font-semibold gap-2.5 rounded-xl shadow-xs',
    lg: 'px-6 py-3 text-sm sm:text-base font-bold gap-3 rounded-2xl shadow-sm',
    pill: 'px-6 py-2.5 text-xs sm:text-sm font-bold gap-2.5 rounded-full shadow-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
