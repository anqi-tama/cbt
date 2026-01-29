
import React from 'react';
import { Button, LanguageSwitcher } from '../../../shared/ui';

interface AssessorLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onLogout: () => void;
  lang: 'id' | 'en';
  onLangChange: (lang: 'id' | 'en') => void;
}

const AssessorLayout: React.FC<AssessorLayoutProps> = ({ 
  children, 
  activeMenu, 
  onMenuChange, 
  onLogout,
  lang,
  onLangChange 
}) => {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'builder', label: 'Paket Soal', icon: '📦' },
    { id: 'monitoring', label: 'Monitoring', icon: '📡' },
    { id: 'review', label: 'Review Jawaban', icon: '📝' },
    { id: 'finalization', label: 'Finalisasi', icon: '🔒' },
    { id: 'audit', label: 'Log Audit', icon: '📜' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shadow-2xl z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
            <div>
              <h1 className="text-white font-bold leading-none">CBT Portal</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Assessor Module</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => onMenuChange(menu.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${activeMenu === menu.id 
                    ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                `}
              >
                <span>{menu.icon}</span>
                {menu.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6 border-t border-slate-800">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Language</p>
            <LanguageSwitcher current={lang} onSwitch={onLangChange} variant="dark" />
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600" />
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">Budi Santoso</p>
              <p className="text-slate-500 text-[10px]">Asesor Senior</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full text-slate-400 hover:text-red-400" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 z-30 shadow-sm">
          <h2 className="font-bold text-slate-800 text-lg uppercase tracking-tight">
            {menus.find(m => m.id === activeMenu)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sync: Active
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AssessorLayout;
