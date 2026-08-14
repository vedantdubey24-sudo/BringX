import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface SubjectData {
  subjectName: string;
  studyHours: number;
  attendance: number;
  previousMarks: number;
  predictedScore: number;
  passed: boolean;
  confidence: number;
}

export interface StudentRecord extends Document {
  studentName: string;
  subjects: SubjectData[];
  overallScore: number;
  overallPerformance: 'Pass' | 'Fail';
  createdAt: Date;
}

const SubjectSchema = new Schema<SubjectData>({
  subjectName:   { type: String, required: true },
  studyHours:    { type: Number, required: true },
  attendance:    { type: Number, required: true },
  previousMarks: { type: Number, required: true },
  predictedScore:{ type: Number, required: true },
  passed:        { type: Boolean, required: true },
  confidence:    { type: Number, required: true },
});

const StudentSchema = new Schema<StudentRecord>({
  studentName:        { type: String, required: true },
  subjects:           { type: [SubjectSchema], required: true },
  overallScore:       { type: Number, required: true },
  overallPerformance: { type: String, enum: ['Pass', 'Fail'], required: true },
  createdAt:          { type: Date, default: Date.now },
});

export const Student = models.Student || model<StudentRecord>('Student', StudentSchema);
