
import React from 'react';

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'indigo';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', disabled, className, fullWidth, loading }) => {
  const base = "px-6 py-2.5 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300",
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400 disabled:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:cursor-not-allowed text-sm`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  className?: string;
}> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'bg-blue-600' }) => (
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
    <div 
      className={`h-full transition-all duration-500 ${color}`} 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
    />
  </div>
);

export const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
);

export const LanguageSwitcher: React.FC<{ 
  current: 'id' | 'en'; 
  onSwitch: (lang: 'id' | 'en') => void;
  variant?: 'light' | 'dark';
}> = ({ current, onSwitch, variant = 'light' }) => {
  const isLight = variant === 'light';
  return (
    <div className={`flex p-1 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-slate-800'} w-fit`}>
      <button 
        onClick={() => onSwitch('id')}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${current === 'id' 
          ? (isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') 
          : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
      >
        ID
      </button>
      <button 
        onClick={() => onSwitch('en')}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${current === 'en' 
          ? (isLight ? 'bg-white text-blue-600 shadow-sm' : 'bg-indigo-600 text-white shadow-lg') 
          : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300')}`}
      >
        EN
      </button>
    </div>
  );
};
