
import React, { useState, useMemo } from 'react';
import { Submission, SubmissionEvent, ExamSession } from '../../../shared/types';
import { Card, Badge, ProgressBar, StatusDot, Button } from '../../../shared/ui';
import { DataTable, Column } from '../../../shared/ui/DataTable';
import { translations } from '../../../app/i18n';

interface MonitoringProps {
  submissions: Submission[];
  exams: ExamSession[];
  lang: 'id' | 'en';
}

const Monitoring: React.FC<MonitoringProps> = ({ submissions, exams, lang }) => {
  const t = translations[lang];
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Filter States
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Display Control State
  const [isApplied, setIsApplied] = useState(false);

  // Derived filtered data
  const filteredSubmissions = useMemo(() => {
    if (!isApplied) return [];

    return submissions.filter(s => {
      const matchExam = examFilter === 'ALL' || s.examId === examFilter;
      
      let matchDate = true;
      if (dateFilter && s.lastActive !== '-') {
        // Simple string comparison for dates YYYY-MM-DD
        const submissionDate = new Date(s.lastActive).toISOString().split('T')[0];
        matchDate = submissionDate === dateFilter;
      } else if (dateFilter && s.lastActive === '-') {
        matchDate = false;
      }
      
      return matchExam && matchDate;
    });
  }, [submissions, examFilter, dateFilter, isApplied]);

  // Summary logic based on filtered data
  const stats = useMemo(() => ({
    total: filteredSubmissions.length,
    notStarted: filteredSubmissions.filter(s => s.status === 'NOT_STARTED').length,
    active: filteredSubmissions.filter(s => s.status === 'ACTIVE').length,
    completed: filteredSubmissions.filter(s => s.status === 'COMPLETED').length,
    disconnected: filteredSubmissions.filter(s => s.status === 'DISCONNECTED').length,
    online: filteredSubmissions.filter(s => s.isOnline).length
  }), [filteredSubmissions]);

  const handleApplyFilter = () => {
    setIsApplied(true);
  };

  const handleResetFilter = () => {
    setExamFilter('ALL');
    setDateFilter('');
    setIsApplied(false);
  };

  const columns: Column<Submission>[] = [
    {
      header: t.assessor.participant,
      accessor: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
            {s.candidateName[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-none">{s.candidateName}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">ID: {s.id}</p>
          </div>
        </div>
      )
    },
    {
      header: t.assessor.connection,
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <StatusDot active={s.isOnline} />
          <span className={`text-xs font-bold ${s.isOnline ? 'text-green-600' : 'text-slate-400'}`}>
            {s.isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (s) => {
        const variants: Record<string, 'neutral' | 'success' | 'info' | 'danger' | 'warning'> = {
          'NOT_STARTED': 'neutral',
          'ACTIVE': 'info',
          'COMPLETED': 'success',
          'DISCONNECTED': 'warning'
        };
        const label: Record<string, string> = {
          'NOT_STARTED': t.assessor.notStarted,
          'ACTIVE': t.assessor.active,
          'COMPLETED': t.assessor.completed,
          'DISCONNECTED': t.assessor.disconnected
        };
        return <Badge variant={variants[s.status]}>{label[s.status]}</Badge>;
      }
    },
    {
      header: t.assessor.progress,
      accessor: (s) => (
        <div className="flex items-center gap-3 min-w-[120px]">
          <ProgressBar value={s.progress} color={s.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-600'} />
          <span className="text-xs font-bold text-slate-600">{s.progress}%</span>
        </div>
      )
    },
    {
      header: t.assessor.lastUpdate,
      accessor: (s) => <span className="text-xs text-slate-500 font-medium">{s.lastActive === '-' ? '-' : new Date(s.lastActive).toLocaleTimeString()}</span>
    },
    {
      header: t.assessor.systemFlag,
      accessor: (s) => (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 min-w-[32px] justify-center">
            {s.flags.length > 0 ? (
              <div className="group relative flex items-center">
                <span className="text-amber-500 text-lg cursor-help">⚠️</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-50 left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:top-full after:left-1/2 after:-ml-1 after:border-4 after:border-transparent after:border-t-slate-800">
                  {s.flags.join(', ')}
                </div>
              </div>
            ) : (
              <span className="text-slate-200">-</span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedSubmission(s); }}
            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-indigo-100"
            title="Lihat Detail"
          >
            <span className="text-sm group-hover/btn:scale-110 transition-transform">👁️</span>
          </button>
        </div>
      ),
      className: 'text-center'
    }
  ];

  const renderEventIcon = (type: SubmissionEvent['type']) => {
    switch (type) {
      case 'SESSION_START': return '🏁';
      case 'CONNECTION_LOST': return '❌';
      case 'CONNECTION_RESTORED': return '🌐';
      case 'APP_RESTART': return '🔄';
      case 'FOCUS_LOST': return '👁️';
      case 'INACTIVITY_FLAG': return '⏳';
      case 'SUBMITTED': return '📤';
      default: return '•';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative flex flex-col h-full">
      {/* 1. Filter Section (Always Visible) */}
      <Card className="p-0 bg-white border-indigo-100 shadow-xl overflow-visible ring-1 ring-slate-200/60">
        <div className="flex flex-col">
          {/* Header area of card */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-200 border border-indigo-400">
              <span className="brightness-200 contrast-150">🔍</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t.assessor.monitoringFilter}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{t.assessor.filterSubtitle}</p>
            </div>
          </div>
          
          {/* Form area */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.assessor.examName}</label>
                <select 
                  value={examFilter}
                  onChange={(e) => {
                    setExamFilter(e.target.value);
                    setIsApplied(false);
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer hover:bg-slate-100/50"
                >
                  <option value="ALL">{t.assessor.allActiveExams}</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.assessor.executionDate}</label>
                <input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setIsApplied(false);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer hover:bg-slate-100/50"
                />
              </div>

              <div className="md:col-span-4 flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={handleResetFilter}
                  className="flex-1 text-[10px] font-black uppercase tracking-widest h-[48px] bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600 shadow-sm"
                >
                  {t.common.reset}
                </Button>
                <Button 
                  variant="indigo"
                  onClick={handleApplyFilter}
                  className="flex-[2] h-[48px] shadow-lg shadow-indigo-200/50 font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
                >
                  {t.assessor.viewMonitoring} →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Results Section (Conditional) */}
      {!isApplied ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl shadow-xl ring-8 ring-slate-100/50 animate-bounce transition-all duration-[2000ms] border border-slate-100">
            📡
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">{t.assessor.noDataTitle}</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mt-3 px-10">
              {t.assessor.noDataDesc}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Overview Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <Card className="md:col-span-4 p-6 bg-indigo-900 text-white border-none shadow-2xl shadow-indigo-900/20 ring-1 ring-white/10">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">{t.assessor.assessingNow}</p>
              <h2 className="text-xl font-bold leading-tight">
                {examFilter === 'ALL' ? t.assessor.allActiveExams : exams.find(e => e.id === examFilter)?.title}
              </h2>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-indigo-300">
                 <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md">
                    <span className="opacity-50 text-[10px]">📅</span>
                    {dateFilter || t.assessor.today}
                 </span>
                 <span className="opacity-30">|</span>
                 <span className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                   {t.assessor.realtimeMonitoring}
                 </span>
              </div>
            </Card>

            <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-white flex flex-col justify-between border-slate-100 hover:scale-[1.02] transition-transform shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{t.assessor.notStarted}</p>
                <p className="text-3xl font-black text-slate-400 mt-1">{stats.notStarted}</p>
              </Card>
              <Card className="p-4 bg-white flex flex-col justify-between border-l-4 border-l-indigo-500 shadow-md hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-bold text-indigo-400 uppercase">{t.assessor.active}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-black text-indigo-600">{stats.active}</p>
                  <span className="text-[10px] font-bold text-green-500">({stats.online} online)</span>
                </div>
              </Card>
              <Card className="p-4 bg-white flex flex-col justify-between border-l-4 border-l-green-500 shadow-md hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-bold text-green-400 uppercase">{t.assessor.completed}</p>
                <p className="text-3xl font-black text-green-600 mt-1">{stats.completed}</p>
              </Card>
              <Card className="p-4 bg-white flex flex-col justify-between border-l-4 border-l-amber-500 shadow-md hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-bold text-amber-400 uppercase">{t.assessor.disconnected}</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{stats.disconnected}</p>
              </Card>
            </div>
          </div>

          {/* Main Table View */}
          <div className="flex-1 min-h-0 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
            <DataTable 
              data={filteredSubmissions} 
              columns={columns} 
              searchPlaceholder={`${t.assessor.participant}...`} 
              searchKey="candidateName"
              onRowClick={setSelectedSubmission}
              emptyMessage={t.assessor.noEvents}
            />
          </div>
        </div>
      )}

      {/* Side Detail Panel (Drill Down) */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500" 
            onClick={() => setSelectedSubmission(null)}
          />
          <div className="relative w-full max-w-md bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col border-l border-slate-200">
            <header className="p-6 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 border border-indigo-400">
                  {selectedSubmission.candidateName[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight leading-none">{selectedSubmission.candidateName}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-2">{t.assessor.participantDetail}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedSubmission(null)} className="w-8 h-8 p-0 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">×</Button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{t.assessor.currentStatus}</p>
                  <p className="font-bold text-slate-800 text-sm">{t.assessor[selectedSubmission.status.toLowerCase() as keyof typeof t.assessor] || selectedSubmission.status}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{t.assessor.lastActivity}</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedSubmission.lastActive === '-' ? '-' : new Date(selectedSubmission.lastActive).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  {t.assessor.technicalLog}
                </h4>
                
                <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-8 py-2">
                  {selectedSubmission.timelineEvents.length === 0 && (
                    <p className="text-xs text-slate-400 italic">{t.assessor.noEvents}</p>
                  )}
                  {selectedSubmission.timelineEvents.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-sm transition-all group-hover:scale-110 group-hover:rotate-6 group-hover:border-indigo-200 group-hover:shadow-md">
                        {renderEventIcon(event.type)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 leading-none group-hover:text-indigo-600 transition-colors">{event.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-2 bg-slate-50 px-2 py-0.5 rounded-md inline-block border border-slate-100">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubmission.flags.length > 0 && (
                <Card className="p-5 bg-amber-50 border-amber-100/50 shadow-lg shadow-amber-900/5 ring-4 ring-amber-50/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    {t.assessor.analysisContext}
                  </h4>
                  <ul className="space-y-3">
                    {selectedSubmission.flags.map((f, i) => (
                      <li key={i} className="text-[11px] text-amber-800 font-bold flex items-start gap-3 bg-white/60 p-2.5 rounded-xl border border-amber-100/50 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 p-3 bg-amber-100/50 rounded-xl border border-amber-200/30">
                    <p className="text-[9px] text-amber-600 font-bold leading-relaxed uppercase tracking-tighter italic">
                      * {t.assessor.analysisNotice}
                    </p>
                  </div>
                </Card>
              )}
            </div>
            
            <footer className="p-6 bg-slate-50 border-t flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 opacity-50">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                 <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.2em]">
                   System Integrity Trace
                 </p>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
              <p className="text-[9px] text-center text-slate-400/80 font-medium max-w-[240px] leading-relaxed">
                {t.assessor.readOnlyFooter}
              </p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
