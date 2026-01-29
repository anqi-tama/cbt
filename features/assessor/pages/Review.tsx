
import React, { useState, useMemo } from 'react';
import { Submission, ExamSession, QuestionType, ReviewStatus, Question } from '../../../shared/types';
import { Card, Badge, Button, ProgressBar } from '../../../shared/ui';
import { DataTable, Column } from '../../../shared/ui/DataTable';
import { translations } from '../../../app/i18n';
import { getAIGradingSuggestion } from '../../../lib/gemini';

interface ReviewProps {
  submissions: Submission[];
  exams: ExamSession[];
  lang: 'id' | 'en';
  onUpdateScore: (subId: string, qId: string, score: number, feedback: string) => void;
}

const Review: React.FC<ReviewProps> = ({ submissions, exams, lang, onUpdateScore }) => {
  const t = translations[lang];

  // Flow State
  const [isApplied, setIsApplied] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);
  
  // AI State
  const [aiLoadingState, setAiLoadingState] = useState<Record<string, boolean>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, { score: number; feedback: string }>>({});

  // Filter Logic
  const filteredSubmissions = useMemo(() => {
    if (!isApplied) return [];
    return submissions.filter(s => {
      const matchExam = s.examId === selectedExamId;
      const matchDate = selectedDate ? new Date(s.lastActive).toISOString().split('T')[0] === selectedDate : true;
      return matchExam && (s.lastActive === '-' ? true : matchDate);
    });
  }, [submissions, selectedExamId, selectedDate, isApplied]);

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Summary Metrics
  const summary = useMemo(() => {
    return {
      total: filteredSubmissions.length,
      started: filteredSubmissions.filter(s => s.status !== 'NOT_STARTED').length,
      completed: filteredSubmissions.filter(s => s.status === 'COMPLETED').length,
    };
  }, [filteredSubmissions]);

  const handleResetFilter = () => {
    setSelectedExamId('');
    setSelectedDate('');
    setIsApplied(false);
  };

  const getReviewStatus = (sub: Submission): ReviewStatus => {
    const exam = exams.find(e => e.id === sub.examId);
    if (!exam) return 'NOT_REVIEWED';

    const essayQuestions = exam.questions.filter(q => q.type === QuestionType.ESSAY);
    if (essayQuestions.length === 0) return 'REVIEWED';

    const reviewedEssays = essayQuestions.filter(q => sub.answers[q.id]?.score !== undefined).length;

    if (reviewedEssays === 0) return 'NOT_REVIEWED';
    if (reviewedEssays < essayQuestions.length) return 'PARTIALLY_REVIEWED';
    return 'REVIEWED';
  };

  const calculateAutoScore = (sub: Submission) => {
    return Object.values(sub.answers).reduce((acc, ans) => {
      const q = selectedExam?.questions.find(q => q.id === ans.questionId);
      if (q && q.type !== QuestionType.ESSAY) return acc + (ans.score || 0);
      return acc;
    }, 0);
  };

  const calculateFinalScore = (sub: Submission) => {
    return Object.values(sub.answers).reduce((acc, ans) => acc + (ans.score || 0), 0);
  };

  const handleGetAISuggestion = async (sub: Submission, q: Question) => {
    const answer = sub.answers[q.id];
    if (!answer?.answer) return;

    setAiLoadingState(prev => ({ ...prev, [q.id]: true }));
    const result = await getAIGradingSuggestion(q.text, answer.answer as string, q.weight);
    if (result) {
      setAiSuggestions(prev => ({ ...prev, [q.id]: result }));
      if (answer.score === undefined || answer.score === 0) {
        onUpdateScore(sub.id, q.id, result.score, result.feedback);
      }
    }
    setAiLoadingState(prev => ({ ...prev, [q.id]: false }));
  };

  const columns: Column<Submission>[] = [
    {
      header: t.assessor.participant,
      accessor: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
            {s.candidateName[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-none">{s.candidateName}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">ID: {s.id}</p>
          </div>
        </div>
      )
    },
    {
      header: t.assessor.examStatus,
      accessor: (s) => (
        <Badge variant={s.status === 'COMPLETED' ? 'success' : 'warning'}>
          {t.assessor[s.status.toLowerCase() as keyof typeof t.assessor] || s.status}
        </Badge>
      )
    },
    {
      header: t.assessor.reviewStatus,
      accessor: (s) => {
        const status = getReviewStatus(s);
        const variants: Record<string, 'neutral' | 'warning' | 'success'> = {
          'NOT_REVIEWED': 'neutral',
          'PARTIALLY_REVIEWED': 'warning',
          'REVIEWED': 'success'
        };
        return <Badge variant={variants[status]}>{t.assessor[status.toLowerCase() as keyof typeof t.assessor] || status}</Badge>;
      }
    },
    {
      header: t.assessor.autoScore,
      accessor: (s) => <span className="font-mono font-bold text-slate-500">{calculateAutoScore(s)}</span>
    },
    {
      header: t.assessor.finalScore,
      accessor: (s) => <span className="font-mono font-black text-indigo-600">{calculateFinalScore(s)}</span>
    },
    {
      header: t.assessor.action,
      accessor: (s) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setViewingSubmission(s); }}
          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
        >
          👁️
        </button>
      ),
      className: 'text-center'
    }
  ];

  if (viewingSubmission && selectedExam) {
    const totalMaxScore = selectedExam.questions.reduce((acc, q) => acc + q.weight, 0);
    const currentScore = calculateFinalScore(viewingSubmission);
    const progressPct = (currentScore / totalMaxScore) * 100;

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Detail Header Section */}
        <div className="mb-8 mt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-12">
              <button onClick={() => setViewingSubmission(null)} className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 font-medium text-sm">
                ← Kembali
              </button>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                  {viewingSubmission.candidateName}
                </h2>
                <div className="flex items-center gap-3">
                  <Badge variant="info" className="bg-blue-50 text-blue-600 border-blue-100 py-1 px-3">
                    ID: {viewingSubmission.id}
                  </Badge>
                  <Badge variant="success" className="bg-green-50 text-green-600 border-green-100 py-1 px-3">
                    SELESAI
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status Review</p>
              <Badge variant={getReviewStatus(viewingSubmission) === 'REVIEWED' ? 'success' : 'warning'} className="px-4 py-1.5 text-xs">
                {getReviewStatus(viewingSubmission).replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
          {/* Main Review Area */}
          <div className="lg:col-span-9 space-y-10 overflow-y-auto pr-6 pb-32 scrollbar-hide">
            {selectedExam.questions.map((q, idx) => {
              const ans = viewingSubmission.answers[q.id];
              const isEssay = q.type === QuestionType.ESSAY;
              const hasSuggestion = !!aiSuggestions[q.id];
              const isLoading = !!aiLoadingState[q.id];
              
              return (
                <div key={q.id} className="space-y-4">
                  <Card className={`p-10 border-2 transition-all duration-300 ${isEssay ? 'border-indigo-100 ring-4 ring-indigo-50/20' : 'border-slate-100 bg-slate-50/30'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-2">
                        <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">{q.topic}</span>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{q.text}</h3>
                      </div>
                      <Badge variant="neutral" className="shrink-0 bg-slate-100 text-slate-600 border-slate-200 px-4 py-1.5 font-bold uppercase">{q.weight} POIN</Badge>
                    </div>
                    
                    <div className="space-y-8">
                      {/* Participant Answer Container */}
                      <div className="p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 relative">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          PESERTA ANSWER
                        </p>
                        <div className="text-sm font-medium text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                          {ans?.answer || "— Peserta tidak memberikan jawaban —"}
                        </div>
                      </div>

                      {/* Grading Section */}
                      {isEssay ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                          {/* AI Recommendation Panel */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Rekomendasi Sistem (AI)</h4>
                              <button 
                                onClick={() => handleGetAISuggestion(viewingSubmission, q)}
                                disabled={isLoading || !ans?.answer}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase flex items-center gap-1.5"
                              >
                                {isLoading ? 'Menganalisa...' : '✨ Dapatkan Saran AI'}
                              </button>
                            </div>

                            <div className={`min-h-[120px] rounded-2xl border-2 border-dotted flex items-center justify-center p-6 text-center
                              ${hasSuggestion ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50/30 border-slate-200'}`}>
                              {hasSuggestion ? (
                                <div className="animate-in fade-in duration-500">
                                   <div className="flex items-baseline gap-1 mb-2">
                                      <span className="text-2xl font-black text-indigo-600">{aiSuggestions[q.id].score}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">/ {q.weight} Pts</span>
                                   </div>
                                   <p className="text-[11px] font-medium text-indigo-900 leading-relaxed italic">"{aiSuggestions[q.id].feedback}"</p>
                                </div>
                              ) : (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-10">Click button above to get AI Analysis</p>
                              )}
                            </div>
                          </div>

                          {/* Manual Input Panel */}
                          <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skor Akhir</label>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    max={q.weight}
                                    min={0}
                                    defaultValue={ans?.score}
                                    onBlur={(e) => onUpdateScore(viewingSubmission.id, q.id, parseFloat(e.target.value) || 0, ans?.feedback || '')}
                                    placeholder="Enter final score..."
                                    className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-black text-xl text-indigo-600 transition-all shadow-inner"
                                  />
                                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 uppercase">/ {q.weight} PTS</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Catatan Asesor</label>
                                <textarea 
                                  defaultValue={ans?.feedback}
                                  onBlur={(e) => onUpdateScore(viewingSubmission.id, q.id, ans?.score || 0, e.target.value)}
                                  className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-xs font-medium text-slate-600 resize-none h-24 transition-all shadow-inner"
                                  placeholder="Reasoning for this grade..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Grader Score</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-800">{ans?.score || 0}</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">/ {q.weight}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-8 bg-white border-slate-200 shadow-2xl rounded-[2rem] overflow-visible relative">
              <div className="space-y-12">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Validation Progress</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <ProgressBar value={progressPct} color="bg-indigo-500" />
                </div>

                <div className="flex flex-col items-center justify-center py-6 text-center border-y border-slate-50">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Total Weighted Score</span>
                  <div className="relative">
                    <span className="text-8xl font-black text-indigo-600 leading-none tracking-tighter">{currentScore}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase bg-slate-50 px-3 py-1 rounded-full">+{currentScore - calculateAutoScore(viewingSubmission)} Points Adjustment</span>
                  </div>
                </div>

                <Button 
                  fullWidth 
                  variant="indigo" 
                  className="h-16 rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
                  onClick={() => setViewingSubmission(null)}
                >
                  Simpan Penilaian →
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-slate-50 border-slate-100 rounded-2xl">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grading Status</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${getReviewStatus(viewingSubmission) === 'REVIEWED' ? 'bg-green-500' : 'bg-amber-400'}`} />
                  <span className="text-xs font-bold text-slate-700 uppercase">{getReviewStatus(viewingSubmission).replace('_', ' ')}</span>
                </div>
                <div className="p-3 bg-white/50 rounded-xl border border-white">
                  <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed italic">
                    Manual validation is required for all essay questions before results are finalized.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative flex flex-col h-full">
      {/* Header Utama Modul */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Review Jawaban</h1>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           Sync: Active
        </div>
      </div>

      <Card className="p-0 bg-white border-indigo-100 shadow-xl overflow-visible ring-1 ring-slate-200/60">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-200 border border-indigo-400">
              <span className="brightness-200 contrast-150">🔍</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t.assessor.reviewFilter}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{t.assessor.reviewFilterSubtitle}</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.assessor.examName}</label>
                <select 
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    setIsApplied(false);
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer hover:bg-slate-100/50"
                >
                  <option value="">-- {t.assessor.examName} --</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.assessor.executionDate}</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
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
                  onClick={() => setIsApplied(true)}
                  disabled={!selectedExamId}
                  className="flex-[2] h-[48px] shadow-lg shadow-indigo-200/50 font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
                >
                  {t.assessor.applyReviewFilter} →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.assessor.totalRegistered}</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{summary.total}</h3>
            </Card>
            <Card className="p-6 bg-white border-l-4 border-l-indigo-500 shadow-sm">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.assessor.startedParticipants}</p>
              <h3 className="text-3xl font-black text-indigo-600 mt-1">{summary.started}</h3>
            </Card>
            <Card className="p-6 bg-white border-l-4 border-l-green-500 shadow-sm">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">{t.assessor.completedParticipants}</p>
              <h3 className="text-3xl font-black text-green-600 mt-1">{summary.completed}</h3>
            </Card>
          </div>

          <div className="flex-1 min-h-0 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
            <DataTable 
              data={filteredSubmissions} 
              columns={columns} 
              searchKey="candidateName" 
              searchPlaceholder={t.assessor.participant + '...'}
              onRowClick={setViewingSubmission}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
