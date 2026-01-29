
import { TranslationSchema } from './types';

export const translations: Record<'id' | 'en', TranslationSchema> = {
  id: {
    common: {
      back: 'Kembali',
      next: 'Selanjutnya',
      submit: 'Kirim',
      cancel: 'Batal',
      confirm: 'Konfirmasi',
      save: 'Simpan',
      loading: 'Memuat...',
    },
    auth: {
      loginAs: 'Masuk Sebagai',
      welcome: 'Selamat Datang',
    },
    participant: {
      dashboard: 'Dashboard Peserta',
      startExam: 'Mulai Ujian',
      upcomingExams: 'Ujian Mendatang',
      examRules: 'Aturan Ujian',
      iUnderstand: 'Saya Mengerti dan Siap',
      timeLeft: 'Sisa Waktu',
      question: 'Pertanyaan',
      answered: 'Dijawab',
      notAnswered: 'Belum Dijawab',
      autoSubmitWarning: 'Ujian akan dikirim otomatis saat waktu habis.',
    },
    assessor: {
      dashboard: 'Dashboard Asesor',
      reviewAnswers: 'Tinjau Jawaban',
      scoreEssay: 'Nilai Esai',
      systemRecommended: 'Rekomendasi Sistem',
      manualOverride: 'Penilaian Manual',
    },
    admin: {
      dashboard: 'Dashboard Admin',
      manageEvents: 'Kelola Acara',
      auditLogs: 'Log Audit',
      liveStatus: 'Status Langsung',
    },
  },
  en: {
    common: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      loading: 'Loading...',
    },
    auth: {
      loginAs: 'Login As',
      welcome: 'Welcome',
    },
    participant: {
      dashboard: 'Participant Dashboard',
      startExam: 'Start Exam',
      upcomingExams: 'Upcoming Exams',
      examRules: 'Exam Rules',
      iUnderstand: 'I Understand and Am Ready',
      timeLeft: 'Time Left',
      question: 'Question',
      answered: 'Answered',
      notAnswered: 'Not Answered',
      autoSubmitWarning: 'Exam will auto-submit when time is up.',
    },
    assessor: {
      dashboard: 'Assessor Dashboard',
      reviewAnswers: 'Review Answers',
      scoreEssay: 'Score Essay',
      systemRecommended: 'System Recommended',
      manualOverride: 'Manual Override',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      manageEvents: 'Manage Events',
      auditLogs: 'Audit Logs',
      liveStatus: 'Live Status',
    },
  }
};
