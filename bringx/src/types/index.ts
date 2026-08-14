export interface SubjectInput {
  studyHours: number;
  attendance: number;
  previousMarks: number;
}

export interface SubjectResult {
  subjectName: string;
  studyHours: number;
  attendance: number;
  previousMarks: number;
  predictedScore: number;
  passed: boolean;
  confidence: number;
}

export interface StudentRecord {
  _id: string;
  studentName: string;
  subjects: SubjectResult[];
  overallScore: number;
  overallPerformance: 'Pass' | 'Fail';
  createdAt: string;
}

export const SUBJECTS = ['Stats', 'DSA', 'DS', 'CG', 'DBMS'] as const;

export const SUBJECT_COLORS = [
  '#6366f1', // indigo – Stats
  '#22d3ee', // cyan   – DSA
  '#f59e0b', // amber  – DS
  '#10b981', // emerald– CG
  '#f43f5e', // rose   – DBMS
];

export const SUBJECT_ICONS = ['📊', '🧮', '🗄️', '🎮', '🗃️'];

export const defaultSubjectInput = (): SubjectInput => ({
  studyHours: 0,
  attendance: 0,
  previousMarks: 0,
});
