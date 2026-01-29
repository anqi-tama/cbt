
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  ASSESSOR = 'ASSESSOR',
  ADMIN = 'ADMIN'
}

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For MCQ
  weight: number;
}

export interface ExamSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: ExamStatus;
  questions: Question[];
}

export interface UserAnswer {
  questionId: string;
  answer: string | number;
  lastSaved: string;
}

export interface ExamState {
  answers: Record<string, UserAnswer>;
  isSubmitting: boolean;
  timeRemaining: number;
  currentQuestionIndex: number;
}

export interface TranslationSchema {
  common: {
    back: string;
    next: string;
    submit: string;
    cancel: string;
    confirm: string;
    save: string;
    loading: string;
  };
  auth: {
    loginAs: string;
    welcome: string;
  };
  participant: {
    dashboard: string;
    startExam: string;
    upcomingExams: string;
    examRules: string;
    iUnderstand: string;
    timeLeft: string;
    question: string;
    answered: string;
    notAnswered: string;
    autoSubmitWarning: string;
  };
  assessor: {
    dashboard: string;
    reviewAnswers: string;
    scoreEssay: string;
    systemRecommended: string;
    manualOverride: string;
  };
  admin: {
    dashboard: string;
    manageEvents: string;
    auditLogs: string;
    liveStatus: string;
  };
}
