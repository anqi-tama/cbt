
import React, { useEffect, useState } from 'react';
import { ExamSession, ExamState, QuestionType } from '../../types';
import { Button, Card, Badge } from '../../components/Shared';
import { translations } from '../../i18n';

interface ExamViewProps {
  exam: ExamSession;
  state: ExamState;
  updateAnswer: (qid: string, ans: string | number) => void;
  lang: 'id' | 'en';
  onFinish: () => void;
}

const ExamView: React.FC<ExamViewProps> = ({ exam, state, updateAnswer, lang, onFinish }) => {
  const t = translations[lang];
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Connectivity simulation
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinish]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[currentIndex];
  const currentAnswer = state.answers[currentQuestion.id]?.answer || '';

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden z-50">
      {/* Secure Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center font-bold">CBT</div>
          <div>
            <h1 className="text-lg font-bold leading-none">{exam.title}</h1>
            <p className="text-xs text-slate-400 mt-1">ID: {exam.id} | Session Active</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{t.participant.timeLeft}</span>
            <span className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-slate-700" />
          <div className="flex flex-col items-start text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Autosave: Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Grid Sidebar */}
        {isSidebarOpen && (
          <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-700 uppercase text-sm tracking-widest">Daftar Soal</h2>
              <Badge variant="info">{exam.questions.length} Total</Badge>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isAnswered = !!state.answers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`
                      h-10 w-10 rounded-md text-sm font-bold transition-all
                      ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 z-10' : ''}
                      ${isAnswered ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div className="w-3 h-3 rounded-sm bg-blue-600" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div className="w-3 h-3 rounded-sm bg-slate-100" />
                <span>Belum Dijawab</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div className="w-3 h-3 rounded-sm ring-2 ring-blue-500 bg-slate-100" />
                <span>Posisi Sekarang</span>
              </div>
            </div>
          </aside>
        )}

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className="w-full max-w-4xl flex flex-col gap-8">
            <Card className="p-8 shadow-sm border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {t.participant.question} {currentIndex + 1}
                </h3>
                <Badge variant="neutral">Bobot: {currentQuestion.weight}</Badge>
              </div>

              <div className="prose prose-slate max-w-none mb-8 text-lg leading-relaxed text-slate-700">
                {currentQuestion.text}
              </div>

              <div className="space-y-4">
                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option, oIdx) => (
                      <label 
                        key={oIdx}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${currentAnswer === option ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name={`q-${currentQuestion.id}`}
                          className="w-5 h-5 text-blue-600"
                          checked={currentAnswer === option}
                          onChange={() => updateAnswer(currentQuestion.id, option)}
                        />
                        <span className="text-slate-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QuestionType.SHORT_ANSWER && (
                  <input 
                    type="text"
                    className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Tuliskan jawaban singkat Anda di sini..."
                    value={currentAnswer}
                    onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                  />
                )}

                {currentQuestion.type === QuestionType.ESSAY && (
                  <textarea 
                    className="w-full h-64 p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Tuliskan esai lengkap Anda di sini..."
                    value={currentAnswer}
                    onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                  />
                )}
              </div>
            </Card>

            <div className="flex items-center justify-between pb-12">
              <Button 
                variant="secondary" 
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
              >
                {t.common.back}
              </Button>

              <div className="text-sm font-medium text-slate-400 italic">
                {state.answers[currentQuestion.id] && `Tersimpan otomatis: ${new Date(state.answers[currentQuestion.id].lastSaved).toLocaleTimeString()}`}
              </div>

              {currentIndex < exam.questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex(prev => prev + 1)}>
                  {t.common.next}
                </Button>
              ) : (
                <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={onFinish}>
                  {t.common.submit} Final
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamView;
