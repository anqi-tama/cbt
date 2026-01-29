
import React, { useState, useMemo } from 'react';
import { Submission, SubmissionEvent, ExamSession } from '../../../shared/types/index';
import { Card, Badge, ProgressBar, StatusDot, Button } from '../../../shared/ui/index';
import { DataTable, Column } from '../../../shared/ui/DataTable';
import { translations } from '../../../app/i18n/index';

interface MonitoringProps {
  submissions: Submission[];
  exams: ExamSession[];
  lang: 'id' | 'en';
}

const Monitoring: React.FC<MonitoringProps> = ({ submissions, exams, lang }) => {
  const t = translations[lang];
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isApplied, setIsApplied] = useState(false);

  const filteredSubmissions = useMemo(() => {
    if (!isApplied) return [];
    return submissions.filter(s => {
      const matchExam = examFilter === 'ALL' || s.examId === examFilter;
      let matchDate = true;
      if (dateFilter && s.lastActive !== '-') {
        const submissionDate = new Date(s.lastActive).toISOString().split('T')[0];
        matchDate = submissionDate === dateFilter;
      } else if (dateFilter && s.lastActive === '-') {
        matchDate = false;
      }
      return matchExam && matchDate;
    });
  }, [submissions, examFilter, dateFilter, isApplied]);

  const handleApplyFilter = () => setIsApplied(true);
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
        const label: Record<string, string> = {
          'NOT_STARTED': t.assessor.notStarted,
          'ACTIVE': t.assessor.active,
          'COMPLETED': t.assessor.completed,
          'DISCONNECTED': t.assessor.disconnected
        };
        return <Badge variant={s.status === 'COMPLETED' ? 'success' : 'info'}>{label[s.status]}</Badge>;
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
          {s.flags.length > 0 && <span className="text-amber-500 text-lg">⚠️</span>}
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedSubmission(s); }}
            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm border border-indigo-100"
          >
            👁️
          </button>
        </div>
      )
    }
  ];

  if (selectedSubmission) {
    const exam = exams.find(e => e.id === selectedSubmission.examId);
    
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedSubmission(null)} className="text-slate-500 hover:text-slate-800">
              ← {t.common.back}
            </Button>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.assessor.participantDetail}</h2>
          </div>
          <Badge variant={selectedSubmission.isOnline ? 'success' : 'neutral'} className="h-fit">
            {selectedSubmission.isOnline ? 'LIVE CONNECTION' : 'SESSION TERMINATED'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Detail Column */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 bg-white border-slate-200">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-8 border-b pb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
                    {selectedSubmission.candidateName[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{selectedSubmission.candidateName}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{exam?.title}</p>
                    <div className="mt-3 flex gap-2">
                       <Badge variant="info">ID: {selectedSubmission.id}</Badge>
                       <Badge variant="neutral">IP: 192.168.1.42</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.assessor.currentStatus}</p>
                   <Badge variant={selectedSubmission.status === 'COMPLETED' ? 'success' : 'info'} className="text-sm px-6 py-1.5">
                    {selectedSubmission.status}
                   </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.assessor.progress}</p>
                   <div className="flex items-center gap-3">
                      <ProgressBar value={selectedSubmission.progress} />
                      <span className="font-black text-slate-700">{selectedSubmission.progress}%</span>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.assessor.lastActivity}</p>
                   <span className="font-bold text-slate-700">{new Date(selectedSubmission.lastActive).toLocaleString()}</span>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Browser</p>
                   <span className="font-bold text-slate-700">CBT Secure Browser v3.2</span>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {t.assessor.technicalLog}
              </h4>
              <div className="space-y-6">
                {selectedSubmission.timelineEvents.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 italic text-sm">{t.assessor.noEvents}</p>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-8">
                    {selectedSubmission.timelineEvents.map((event, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ring-4 ring-slate-50
                          ${event.type === 'FOCUS_LOST' || event.type === 'CONNECTION_LOST' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                          <p className="text-sm font-bold text-slate-700">{event.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter italic">{event.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Column (Flags) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-8 border-red-100 bg-red-50/20 shadow-xl shadow-red-100/10">
              <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                ⚠️ {t.assessor.systemFlag}
              </h4>
              <div className="space-y-4">
                {selectedSubmission.flags.length === 0 ? (
                  <div className="py-6 bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase italic">No violation flags</p>
                  </div>
                ) : (
                  selectedSubmission.flags.map((flag, i) => (
                    <div key={i} className="p-4 bg-white border border-red-200 rounded-xl shadow-sm animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3 text-red-600 mb-2">
                        <span className="text-lg">🚫</span>
                        <span className="text-xs font-black uppercase tracking-tight">Security Trigger</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{flag}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-red-100 space-y-4">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.assessor.analysisContext}</h5>
                 <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                   {t.assessor.analysisNotice}
                 </p>
              </div>
            </Card>

            <Card className="p-6 bg-slate-800 text-white">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Audit Logs Info</h4>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">
                 {t.assessor.readOnlyFooter}
               </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative flex flex-col h-full">
      <Card className="p-0 bg-white border-indigo-100 shadow-xl overflow-visible ring-1 ring-slate-200/60">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.assessor.examName}</label>
              <select 
                value={examFilter}
                onChange={(e) => { setExamFilter(e.target.value); setIsApplied(false); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
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
                onChange={(e) => { setDateFilter(e.target.value); setIsApplied(false); }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              />
            </div>
            <div className="md:col-span-4 flex gap-3">
              <Button variant="secondary" onClick={handleResetFilter} className="flex-1 text-[10px] font-black uppercase">{t.common.reset}</Button>
              <Button variant="indigo" onClick={handleApplyFilter} className="flex-[2] shadow-lg font-black uppercase text-xs">{t.assessor.viewMonitoring} →</Button>
            </div>
          </div>
        </div>
      </Card>

      {!isApplied ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl shadow-xl ring-8 ring-slate-100/50">📡</div>
          <div className="max-w-md">
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">{t.assessor.noDataTitle}</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mt-3">{t.assessor.noDataDesc}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1 min-h-0 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
            <DataTable 
              data={filteredSubmissions} 
              columns={columns} 
              searchPlaceholder={`${t.assessor.participant}...`} 
              searchKey="candidateName"
              onRowClick={setSelectedSubmission}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
