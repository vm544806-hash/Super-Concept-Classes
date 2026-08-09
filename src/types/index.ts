export type CategoryType = 
  | 'Class 10th' 
  | 'Class 11th' 
  | 'Class 12th All Stream' 
  | 'B.A';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'single' | 'multiple' | 'true_false' | 'paragraph';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  testId: string;
  question: string;
  imageUrl?: string;
  paragraphText?: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer: string | string[]; // 'A' or ['A', 'C'] or 'True'
  explanation: string;
  subject: string;
  topic?: string;
  difficulty: DifficultyLevel;
  marks?: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  imageUrl: string;
  durationMins: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number; // e.g. 0.25 or 0.33 or 0
  passingMarks: number;
  instructions: string[];
  isPublished: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  createdAt: string; // ISO string or firestore timestamp
  updatedAt?: string;
  attemptsCount?: number;
  testVersion?: number; // Increments when admin modifies questions/re-enables exam
  allowRetake?: boolean; // If true, allows students to attempt multiple times
}

export interface StudentInfo {
  name: string;
  mobile?: string;
  email?: string;
  language: 'English' | 'Hindi' | 'Bilingual';
}

export interface UserResponse {
  questionId: string;
  selectedOptions: string[]; // ['A'] or ['A', 'B']
  status: 'answered' | 'marked' | 'marked_answered' | 'skipped' | 'unvisited';
  timeSpentSeconds?: number;
}

export interface ExamResult {
  id: string;
  testId: string;
  testTitle: string;
  category: string;
  studentName: string;
  studentMobile?: string;
  studentEmail?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  totalDurationSeconds: number;
  submittedAt: string;
  testVersion?: number;
  responses: Record<string, UserResponse>; // questionId -> UserResponse
  rank?: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  isImportant?: boolean;
  linkUrl?: string;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTakenFormatted: string;
  timeTakenSeconds?: number;
  date: string;
  rank?: number;
}

export interface SiteSettings {
  websiteName: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  adsEnabled: boolean;
  adsenseClientId?: string;
  socialLinks: {
    facebook?: string;
    telegram?: string;
    youtube?: string;
    twitter?: string;
  };
}
