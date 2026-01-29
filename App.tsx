
import React, { useState, useEffect } from 'react';
import { UserRole, Submission, QuestionType, ExamSession } from './shared/types';
import { useAppState } from './app/store';
import { translations } from './app/i18n';
import { Button, Card, Badge, LanguageSwitcher } from './shared/ui';
import ExamView from './features/participant/ExamView';
import AssessorLayout from './features/assessor/components/AssessorLayout';
import AssessorDashboard from './features/assessor/pages/Dashboard';
import Monitoring from './features/assessor/pages/Monitoring';
import AuditLogs from './features/assessor/pages/AuditLogs';
import Review from './features/assessor/pages/Review';

const App: React.FC = () => {
  const { 
    role, setRole, 
    lang, setLang, 
    activeExam, setActiveExam, 
    examState,
    updateAnswer,
    submissions,
    updateSubmissionAnswer,
    auditLogs,
    finalizeSubmission,
    kmsPackages,
    cbtPackages,
    syncKms,
    createCbtPackage
  } = useAppState();

  const [preExamConfirmed, setPreExamConfirmed] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const t = translations[lang];

  // Ensure HTML attributes update for accessibility and future RTL
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
  }, [lang]);

  // Handle language switch with immediate reactive update
  const handleLangSwitch = (newLang: 'id' | 'en') => {
    setLang(newLang);
    // If the user wants a full reload for absolute consistency:
    // localStorage.setItem('cbt_lang_pref', newLang);
    // window.location.reload();
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 transition-all duration-500">
        <div className="mb-6">
          <LanguageSwitcher current={lang} onSwitch={handleLangSwitch} variant="dark" />
        </div>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 transform hover:scale-[1.01] transition-transform">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl font-black shadow-2xl shadow-blue-500/30">C</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Secure CBT</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">{t.auth.welcome}</p>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-[0.3em] mb-6">{t.auth.loginAs}</p>
            <Button fullWidth onClick={() => setRole(UserRole.PARTICIPANT)} className="h-14 rounded-2xl">
              {lang === 'id' ? 'MASUK SEBAGAI PESERTA' : 'LOGIN AS PARTICIPANT'}
            </Button>
            <Button fullWidth variant="indigo" onClick={() => setRole(UserRole.ASSESSOR)} className="h-14 rounded-2xl">
              {lang === 'id' ? 'MASUK SEBAGAI ASESOR' : 'LOGIN AS ASSESSOR'}
            </Button>
          </div>
        </div>
        <p className="mt-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-50">
          &copy; 2025 SecureCBT Systems • Enterprise v3.0
        </p>
      </div>
    );
  }

  if (role === UserRole.ASSESSOR) {
    const renderContent = () => {
      switch (activeMenu) {
        case 'dashboard': return <AssessorDashboard submissions={submissions} exams={cbtPackages} onSelectSubmission={setSelectedSub} />;
        case 'monitoring': return <Monitoring submissions={submissions} exams={cbtPackages} lang={lang} />;
        case 'review': return (
          <Review 
            submissions={submissions} 
            exams={cbtPackages} 
            lang={lang} 
            onUpdateScore={(subId, qId, score, feedback) => {
              updateSubmissionAnswer(subId, qId, { score, feedback });
            }}
          />
        );
        case 'audit': return <AuditLogs logs={auditLogs} />;
        default: return <AssessorDashboard submissions={submissions} exams={cbtPackages} onSelectSubmission={setSelectedSub} />;
      }
    };

    return (
      <AssessorLayout 
        activeMenu={activeMenu} 
        onMenuChange={(m) => setActiveMenu(m)}
        onLogout={() => setRole(null)}
        lang={lang}
        onLangChange={handleLangSwitch}
      >
        {renderContent()}
      </AssessorLayout>
    );
  }

  if (role === UserRole.PARTICIPANT) {
    if (examFinished) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <Card className="max-w-xl w-full p-12 space-y-8 rounded-[2.5rem] shadow-2xl">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner border border-green-200">✓</div>
             <div>
               <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{lang === 'id' ? 'Ujian Selesai' : 'Exam Finished'}</h1>
               <p className="text-slate-500 mt-2 font-medium">{lang === 'id' ? 'Jawaban Anda telah aman terkirim.' : 'Your answers have been securely submitted.'}</p>
             </div>
             <Button variant="secondary" onClick={() => window.location.reload()} className="h-12 px-10 rounded-xl uppercase font-black tracking-widest">
               {lang === 'id' ? 'Keluar Sesi' : 'Exit Session'}
             </Button>
          </Card>
        </div>
      );
    }

    if (activeExam) {
      return (
        <ExamView 
          exam={activeExam} 
          state={examState} 
          updateAnswer={updateAnswer} 
          lang={lang} 
          onLangChange={handleLangSwitch}
          onFinish={() => setExamFinished(true)}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b px-10 py-5 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="font-black text-2xl text-blue-600 tracking-tighter">SecureCBT</div>
            <LanguageSwitcher current={lang} onSwitch={handleLangSwitch} />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.participant.dashboard}</span>
                <span className="text-sm font-bold text-slate-800">Siti Aminah</span>
             </div>
             <Button variant="ghost" onClick={() => setRole(null)} className="text-slate-400 font-bold hover:text-red-500">Log Out</Button>
          </div>
        </header>
        <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl font-black text-slate-800 mb-10 uppercase tracking-tight">{t.participant.upcomingExams}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cbtPackages.map(exam => (
              <Card key={exam.id} className="p-8 hover:shadow-2xl transition-all hover:-translate-y-1 duration-300 rounded-3xl border-slate-200/60">
                 <Badge variant="info" className="mb-4">Active Session</Badge>
                 <h3 className="text-2xl font-black text-slate-800 mb-6 leading-tight uppercase">{exam.title}</h3>
                 <div className="flex items-center justify-between mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-2xl">
                   <span>⏱️ {exam.durationMinutes} Minutes</span>
                   <span>📑 {exam.questions.length} Questions</span>
                 </div>
                 <Button fullWidth onClick={() => setActiveExam(exam)} className="h-14 rounded-2xl uppercase font-black tracking-widest">
                   {t.participant.startExam} →
                 </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default App;
