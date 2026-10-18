import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'disabled' | 'completed' | 'refunded' | 'pending' | 'expired' | 'warning' | 'good';
  text?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className = '' }) => {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    disabled: { label: 'Disabled', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    completed: { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    refunded: { label: 'Refunded', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    pending: { label: 'Pending', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    expired: { label: 'Expired', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    warning: { label: 'Expiring Soon', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    good: { label: 'Optimal Shelf Life', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  };

  const item = map[status] || { label: status, color: 'text-slate-600 bg-slate-100 border-slate-200' };
  const label = text || item.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${item.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};
