
import { useState, useEffect } from 'react';
import { UserRole, ExamSession, ExamState, UserAnswer } from './types';

// Mock Data
export const MOCK_EXAMS: ExamSession[] = [
  {
    id: 'exam-1',
    title: 'Ujian Sertifikasi Kompetensi - Level 1',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    durationMinutes: 60,
    status: 'ONGOING' as any,
    questions: [
      {
        id: 'q1',
        type: 'MULTIPLE_CHOICE' as any,
        text: 'Manakah dari berikut ini yang merupakan protokol lapisan transport?',
        options: ['HTTP', 'TCP', 'IP', 'Ethernet'],
        weight: 10
      },
      {
        id: 'q2',
        type: 'SHORT_ANSWER' as any,
        text: 'Sebutkan singkatan dari RAM.',
        weight: 10
      },
      {
        id: 'q3',
        type: 'ESSAY' as any,
        text: 'Jelaskan perbedaan antara TCP dan UDP secara rinci.',
        weight: 30
      }
    ]
  }
];

export const useAppState = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [activeExam, setActiveExam] = useState<ExamSession | null>(null);
  const [examState, setExamState] = useState<ExamState>({
    answers: JSON.parse(localStorage.getItem('cbt_autosave') || '{}'),
    isSubmitting: false,
    timeRemaining: 3600,
    currentQuestionIndex: 0
  });

  // Autosave to localStorage
  useEffect(() => {
    localStorage.setItem('cbt_autosave', JSON.stringify(examState.answers));
  }, [examState.answers]);

  const updateAnswer = (questionId: string, answer: string | number) => {
    setExamState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: {
          questionId,
          answer,
          lastSaved: new Date().toISOString()
        }
      }
    }));
  };

  return {
    role, setRole,
    lang, setLang,
    activeExam, setActiveExam,
    examState, setExamState,
    updateAnswer
  };
};
