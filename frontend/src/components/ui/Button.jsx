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
      'bg-[#244C3B] hover:bg-[#1A3B2C] active:bg-[#132D22] text-white shadow-sm focus-visible:ring-[#244C3B] dark:bg-[#DFD0B8] dark:text-[#222831] dark:hover:bg-[#ECE3D4] dark:active:bg-[#D4C3A8] dark:focus-visible:ring-[#DFD0B8]',
    secondary:
      'bg-[#F0F0EB] hover:bg-[#E8E8DF] active:bg-[#DEDED7] text-[#202A23] focus-visible:ring-[#244C3B] dark:bg-[#393E46] dark:hover:bg-[#454B54] dark:active:bg-[#30353C] dark:text-[#DFD0B8] dark:focus-visible:ring-[#DFD0B8]',
    outline:
      'border border-[#D4D4CA] dark:border-[#4F5561] bg-transparent hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus-visible:ring-[#244C3B] dark:focus-visible:ring-[#DFD0B8]',
    ghost:
      'bg-transparent hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] text-[#4A5749] dark:text-[#C8BFB0] focus-visible:ring-[#244C3B] dark:focus-visible:ring-[#DFD0B8]',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600',
    success:
      'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-sm focus-visible:ring-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500',
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
