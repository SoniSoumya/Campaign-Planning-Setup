import React from 'react';

export const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
};

export const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-ctBlue text-white hover:bg-blue-700 border border-ctBlue',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600',
  };
  return <button className={`rounded-lg px-3 py-2 text-sm font-medium transition ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export const Input = (props) => <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...props} />;
export const TextArea = (props) => <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...props} />;
export const Select = ({ children, ...props }) => <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...props}>{children}</select>;

export const Header = ({ title, subtitle, actions }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex gap-2">{actions}</div>
  </div>
);
