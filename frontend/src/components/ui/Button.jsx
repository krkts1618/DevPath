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
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary:
      'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-pressed)] text-[var(--accent-text)] shadow-xs focus-visible:ring-[var(--accent-primary)] dark:font-semibold',
    amber:
      'bg-[#F2A93B] hover:bg-[#FFC15A] active:bg-[#D98B20] text-[#12151A] font-semibold shadow-xs focus-visible:ring-[#F2A93B]',
    secondary:
      'bg-[#F0F2ED] hover:bg-[#E4E7E0] active:bg-[#D5DBD1] text-[#202620] border border-[#E4E7E0] focus-visible:ring-[#C77B16] dark:bg-[#252C35] dark:hover:bg-[#2B333D] dark:active:bg-[#1D232B] dark:text-[#F3F4F6] dark:border-[#303945] dark:focus-visible:ring-[#F2A93B]',
    outline:
      'border border-[#D5DBD1] bg-transparent hover:bg-[#F0F2ED] text-[#202620] focus-visible:ring-[#C77B16] dark:border-[#3A4552] dark:hover:bg-[#252C35] dark:text-[#F3F4F6] dark:focus-visible:ring-[#F2A93B]',
    ghost:
      'bg-transparent hover:bg-[#F0F2ED] text-[#596258] hover:text-[#202620] focus-visible:ring-[#C77B16] dark:hover:bg-[#252C35] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] dark:focus-visible:ring-[#F2A93B]',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-500',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
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
