
import React, { useState } from 'react';
import { Submission, Question, UserAnswer } from '../../../shared/types';
import { Button, Card, Badge } from '../../../shared/ui';
import { translations } from '../../../app/i18n';
import { getAIGradingSuggestion } from '../../../lib/gemini';

interface EssayScoringProps {
  submission: Submission;
  question: Question;
  answer: UserAnswer;
  lang: 'id' | 'en';
  onSave: (score: number, feedback: string) => void;
  onBack: () => void;
}

const EssayScoring: React.FC<EssayScoringProps> = ({ submission, question, answer, lang, onSave, onBack }) => {
  const t = translations[lang];
  const [manualScore, setManualScore] = useState<string>(answer.score?.toString() || '');
  const [feedback, setFeedback] = useState(answer.feedback || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number; feedback: string } | null>(null);

  const handleAIScore = async () => {
    setAiLoading(true);
    const result = await getAIGradingSuggestion(question.text, answer.answer as string, question.weight);
    if (result) {
      setAiResult(result);
      setManualScore(result.score.toString());
      setFeedback(result.feedback);
    }
    setAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>← {t.common.back}</Button>
          <h2 className="text-2xl font-bold text-slate-800">{t.assessor.scoreEssay}</h2>
        </div>
        <Badge variant="info">Bobot Soal: {question.weight}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Student Response */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <Card className="p-6 bg-slate-50 border-slate-300">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Pertanyaan</h3>
            <p className="text-lg text-slate-800 leading-relaxed font-medium">{question.text}</p>
          </Card>
          
          <Card className="p-6 flex-1 bg-white">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Jawaban Peserta: {submission.candidateName}</h3>
            <div className="text-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
              {answer.answer}
            </div>
          </Card>
        </div>

        {/* Grading Panel */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 border-indigo-200 bg-indigo-50/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-indigo-900">{t.assessor.systemRecommended}</h3>
              <Button 
                variant="indigo" 
                className="text-xs" 
                loading={aiLoading} 
                onClick={handleAIScore}
              >
                {t.assessor.generateAI}
              </Button>
            </div>

            {aiResult ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-indigo-600">{aiResult.score}</span>
                  <span className="text-lg text-slate-400 font-medium mb-1">/ {question.weight}</span>
                </div>
                <div className="p-4 bg-white rounded-lg border border-indigo-100 text-sm text-indigo-800 italic">
                  "{aiResult.feedback}"
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm italic">
                Klik tombol di atas untuk mendapatkan analisa penilaian otomatis berbasis AI.
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-slate-800">{t.assessor.manualOverride}</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Skor Akhir (0 - {question.weight})</label>
              <input 
                type="number" 
                max={question.weight}
                min={0}
                value={manualScore}
                onChange={(e) => setManualScore(e.target.value)}
                className="w-full text-3xl font-bold p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Umpan Balik untuk Peserta</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Berikan alasan atau catatan penilaian..."
              />
            </div>

            <Button 
              fullWidth 
              variant="indigo" 
              onClick={() => onSave(parseFloat(manualScore), feedback)}
              disabled={!manualScore}
            >
              Simpan Penilaian
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EssayScoring;
