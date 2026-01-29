
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  ASSESSOR = 'ASSESSOR',
  ADMIN = 'ADMIN'
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
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
  options?: string[];
  weight: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  sourcePackageId?: string;
}

export interface KmsPackage {
  id: string;
  name: string;
  topic: string;
  totalQuestions: number;
  composition: {
    easy: number;
    medium: number;
    hard: number;
  };
  lastSync: string;
  syncStatus: 'SUCCESS' | 'ERROR' | 'SYNCING';
  questions: Question[];
}

export interface ExamSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: ExamStatus;
  questions: Question[];
  config: {
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showResultsImmediately: boolean;
  };
}

export interface UserAnswer {
  questionId: string;
  answer: string | number;
  lastSaved: string;
  score?: number;
  feedback?: string;
  aiSuggestedScore?: number;
  aiFeedback?: string;
}

export type MonitoringStatus = 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'DISCONNECTED';
export type ReviewStatus = 'NOT_REVIEWED' | 'PARTIALLY_REVIEWED' | 'REVIEWED';

export interface SubmissionEvent {
  timestamp: string;
  type: 'SESSION_START' | 'CONNECTION_LOST' | 'CONNECTION_RESTORED' | 'APP_RESTART' | 'FOCUS_LOST' | 'INACTIVITY_FLAG' | 'SUBMITTED';
  label: string;
}

export interface Submission {
  id: string;
  candidateName: string;
  examId: string;
  status: MonitoringStatus;
  progress: number; // 0-100
  lastActive: string;
  isOnline: boolean;
  answers: Record<string, UserAnswer>;
  totalScore?: number;
  isLocked?: boolean;
  flags: string[];
  timelineEvents: SubmissionEvent[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
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
    reset: string;
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
    packageBuilder: string;
    monitoring: string;
    reviewAnswers: string;
    scoreEssay: string;
    systemRecommended: string;
    manualOverride: string;
    generateAI: string;
    finalization: string;
    auditLogs: string;
    notStarted: string;
    active: string;
    completed: string;
    disconnected: string;
    systemFlag: string;
    monitoringFilter: string;
    filterSubtitle: string;
    examName: string;
    allActiveExams: string;
    executionDate: string;
    viewMonitoring: string;
    noDataTitle: string;
    noDataDesc: string;
    assessingNow: string;
    activeToday: string;
    today: string;
    realtimeMonitoring: string;
    participantDetail: string;
    currentStatus: string;
    lastActivity: string;
    technicalLog: string;
    noEvents: string;
    analysisContext: string;
    analysisNotice: string;
    readOnlyFooter: string;
    connection: string;
    progress: string;
    lastUpdate: string;
    participant: string;
    reviewFilter: string;
    reviewFilterSubtitle: string;
    applyReviewFilter: string;
    assessmentSummary: string;
    totalRegistered: string;
    startedParticipants: string;
    completedParticipants: string;
    notReviewed: string;
    partiallyReviewed: string;
    reviewed: string;
    autoScore: string;
    finalScore: string;
    action: string;
    reviewStatus: string;
    examStatus: string;
    saveReview: string;
    reviewComplete: string;
    points: string;
    assessorNote: string;
  };
  // Added admin property to match usage in translation files and fix TypeScript errors
  admin: {
    dashboard: string;
    manageEvents: string;
    auditLogs: string;
    liveStatus: string;
  };
}
