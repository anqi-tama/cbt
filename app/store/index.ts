
import { useState, useEffect } from 'react';
import { UserRole, ExamSession, ExamState, Submission, ExamStatus, Question, QuestionType, AuditLog, KmsPackage, UserAnswer } from '../../shared/types';

// Mock data for initial questions
export const QUESTION_BANK: Question[] = [
  { id: 'b1', type: QuestionType.MULTIPLE_CHOICE, topic: 'Networking', difficulty: 'EASY', text: 'Apa kepanjangan dari IP?', options: ['Internet Protocol', 'Internal Power', 'Instant Page'], weight: 5, correctAnswer: 'Internet Protocol' },
  { id: 'b2', type: QuestionType.MULTIPLE_CHOICE, topic: 'Hardware', difficulty: 'MEDIUM', text: 'Komponen mana yang disebut otak komputer?', options: ['RAM', 'CPU', 'GPU', 'SSD'], weight: 10, correctAnswer: 'CPU' },
  { id: 'b3', type: QuestionType.ESSAY, topic: 'Programming', difficulty: 'HARD', text: 'Jelaskan konsep Polymorphism dalam OOP.', weight: 30, correctAnswer: 'Polymorphism adalah kemampuan suatu objek untuk mengambil banyak bentuk, biasanya melalui overriding atau overloading.' },
  { id: 'b4', type: QuestionType.SHORT_ANSWER, topic: 'Networking', difficulty: 'MEDIUM', text: 'Port default untuk HTTP adalah...', weight: 10, correctAnswer: '80' },
];

// Complete set of questions for the demo exam
const DEMO_QUESTIONS: Question[] = [
  { id: 'q1', type: QuestionType.MULTIPLE_CHOICE, difficulty: 'EASY', topic: 'Networking', text: 'Layer 3 di model OSI adalah?', options: ['Network', 'Transport', 'Data Link'], weight: 10, correctAnswer: 'Network' },
  { id: 'q2', type: QuestionType.SHORT_ANSWER, difficulty: 'MEDIUM', topic: 'Networking', text: 'Apa singkatan dari RAM?', weight: 10, correctAnswer: 'Random Access Memory' },
  { id: 'q3', type: QuestionType.ESSAY, difficulty: 'HARD', topic: 'Networking', text: 'Jelaskan perbedaan mendalam antara TCP dan UDP.', weight: 30, correctAnswer: 'TCP adalah berorientasi koneksi, menjamin pengiriman paket secara berurutan. UDP adalah tanpa koneksi, lebih cepat tapi tidak menjamin pengiriman paket.' }
];

export const MOCK_KMS_PACKAGES: KmsPackage[] = [
  {
    id: 'kms-1',
    name: 'Bank Soal Jaringan Dasar',
    topic: 'Networking',
    totalQuestions: 4,
    composition: { easy: 2, medium: 1, hard: 1 },
    lastSync: new Date().toISOString(),
    syncStatus: 'SUCCESS',
    questions: [
      { id: 'k1-q1', type: QuestionType.MULTIPLE_CHOICE, difficulty: 'EASY', topic: 'Networking', text: 'Protokol yang digunakan untuk mengirim email adalah?', options: ['SMTP', 'HTTP', 'FTP'], weight: 10, sourcePackageId: 'kms-1', correctAnswer: 'SMTP' },
      { id: 'k1-q2', type: QuestionType.MULTIPLE_CHOICE, difficulty: 'MEDIUM', topic: 'Networking', text: 'Berapakah jumlah bit pada IPv6?', options: ['32', '64', '128'], weight: 15, sourcePackageId: 'kms-1', correctAnswer: '128' },
      { id: 'k1-q3', type: QuestionType.SHORT_ANSWER, difficulty: 'EASY', topic: 'Networking', text: 'Apa kepanjangan dari LAN?', weight: 10, sourcePackageId: 'kms-1', correctAnswer: 'Local Area Network' },
      { id: 'k1-q4', type: QuestionType.ESSAY, difficulty: 'HARD', topic: 'Networking', text: 'Jelaskan fungsi dari Subnet Mask.', weight: 25, sourcePackageId: 'kms-1', correctAnswer: 'Subnet mask digunakan untuk membedakan Network ID dan Host ID pada alamat IP.' },
    ]
  },
  {
    id: 'kms-2',
    name: 'Hardware & OS Master',
    topic: 'Hardware',
    totalQuestions: 3,
    composition: { easy: 1, medium: 2, hard: 0 },
    lastSync: new Date(Date.now() - 86400000).toISOString(),
    syncStatus: 'SUCCESS',
    questions: [
      { id: 'k2-q1', type: QuestionType.MULTIPLE_CHOICE, difficulty: 'EASY', topic: 'Hardware', text: 'Alat input pada komputer adalah?', options: ['Monitor', 'Keyboard', 'Printer'], weight: 5, sourcePackageId: 'kms-2', correctAnswer: 'Keyboard' },
      { id: 'k2-q2', type: QuestionType.MULTIPLE_CHOICE, difficulty: 'MEDIUM', topic: 'Hardware', text: 'Penyimpanan sementara pada komputer disebut?', options: ['Harddisk', 'RAM', 'ROM'], weight: 10, sourcePackageId: 'kms-2', correctAnswer: 'RAM' },
      { id: 'k2-q3', type: QuestionType.SHORT_ANSWER, difficulty: 'MEDIUM', topic: 'OS', text: 'Sebutkan contoh sistem operasi open source.', weight: 15, sourcePackageId: 'kms-2', correctAnswer: 'Linux' },
    ]
  },
  {
    id: 'kms-3',
    name: 'Logika Pemrograman (Expert)',
    topic: 'Programming',
    totalQuestions: 2,
    composition: { easy: 0, medium: 0, hard: 2 },
    lastSync: new Date(Date.now() - 172800000).toISOString(),
    syncStatus: 'SUCCESS',
    questions: [
      { id: 'k3-q1', type: QuestionType.ESSAY, difficulty: 'HARD', topic: 'Programming', text: 'Analisis kompleksitas algoritma Quick Sort dalam kasus terburuk.', weight: 40, sourcePackageId: 'kms-3', correctAnswer: 'O(n^2) terjadi jika pivot yang dipilih selalu elemen terkecil atau terbesar.' },
      { id: 'k3-q2', type: QuestionType.ESSAY, difficulty: 'HARD', topic: 'Programming', text: 'Buatlah rancangan database untuk sistem E-commerce sederhana.', weight: 50, sourcePackageId: 'kms-3', correctAnswer: 'Rancangan harus mencakup tabel Users, Products, Orders, dan Order_Items dengan relasi yang tepat.' },
    ]
  }
];

export const MOCK_EXAMS: ExamSession[] = [
  {
    id: 'exam-1',
    title: 'Ujian Sertifikasi Kompetensi - Level 1',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    durationMinutes: 60,
    status: ExamStatus.ONGOING,
    config: { randomizeQuestions: true, randomizeOptions: true, showResultsImmediately: false },
    questions: DEMO_QUESTIONS
  }
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-perfect',
    candidateName: 'Siti Aminah',
    examId: 'exam-1',
    status: 'COMPLETED',
    progress: 100,
    isOnline: false,
    lastActive: new Date(Date.now() - 300000).toISOString(),
    answers: {
      'q1': { questionId: 'q1', answer: 'Network', lastSaved: new Date().toISOString(), score: 10 },
      'q2': { questionId: 'q2', answer: 'Random Access Memory', lastSaved: new Date().toISOString(), score: 10 },
      'q3': { 
        questionId: 'q3', 
        answer: 'TCP adalah protokol berorientasi koneksi yang menjamin pengiriman data, sedangkan UDP adalah protokol tanpa koneksi yang mengutamakan kecepatan tanpa jaminan pengiriman.', 
        lastSaved: new Date().toISOString() 
      }
    },
    flags: [],
    timelineEvents: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'SESSION_START', label: 'Sesi dimulai' },
      { timestamp: new Date(Date.now() - 300000).toISOString(), type: 'SUBMITTED', label: 'Jawaban dikirimkan' },
    ]
  },
  {
    id: 'sub-active',
    candidateName: 'Ahmad Faisal',
    examId: 'exam-1',
    status: 'ACTIVE',
    progress: 45,
    isOnline: true,
    lastActive: new Date().toISOString(),
    answers: {
       'q1': { questionId: 'q1', answer: 'Network', lastSaved: new Date().toISOString(), score: 10 }
    },
    flags: ['Sering beralih tab browser'],
    timelineEvents: [
      { timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'SESSION_START', label: 'Sesi dimulai' },
      { timestamp: new Date(Date.now() - 1200000).toISOString(), type: 'FOCUS_LOST', label: 'Kehilangan fokus (Switch tab/window)' },
    ]
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: new Date().toISOString(), action: 'SYSTEM_START', details: 'CBT System initialized.', user: 'SYSTEM' }
];

export const useAppState = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [activeExam, setActiveExam] = useState<ExamSession | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [kmsPackages, setKmsPackages] = useState<KmsPackage[]>(MOCK_KMS_PACKAGES);
  const [cbtPackages, setCbtPackages] = useState<ExamSession[]>(MOCK_EXAMS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
  const [examState, setExamState] = useState<ExamState>({
    answers: {},
    isSubmitting: false,
    timeRemaining: 3600,
    currentQuestionIndex: 0
  });

  const syncKms = async () => {
    // Simulate re-sync
    setKmsPackages(MOCK_KMS_PACKAGES);
  };
  
  const createCbtPackage = (newPackage: ExamSession) => setCbtPackages(prev => [newPackage, ...prev]);
  const updateAnswer = (questionId: string, answer: string | number) => {
    setExamState(prev => ({ ...prev, answers: { ...prev.answers, [questionId]: { questionId, answer, lastSaved: new Date().toISOString() } } }));
  };

  const updateSubmissionAnswer = (submissionId: string, questionId: string, updates: Partial<UserAnswer>) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          answers: { ...sub.answers, [questionId]: { ...sub.answers[questionId], ...updates, lastSaved: new Date().toISOString() } }
        };
      }
      return sub;
    }));
  };

  const finalizeSubmission = (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'COMPLETED' } : s));
  };

  return {
    role, setRole, lang, setLang, activeExam, setActiveExam, examState, setExamState,
    submissions, setSubmissions, kmsPackages, cbtPackages, syncKms, createCbtPackage,
    updateAnswer, updateSubmissionAnswer, auditLogs, finalizeSubmission
  };
};
