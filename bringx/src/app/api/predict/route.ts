import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FLASK_URL = process.env.FLASK_API_URL || 'http://127.0.0.1:5000';
const SUBJECTS  = ['Stats', 'DSA', 'DS', 'CG', 'DBMS'];

// ── File paths ────────────────────────────────────────────────
const ROOT_DIR  = path.join(process.cwd(), '..'); // ds mini/
const DATA_DIR  = path.join(ROOT_DIR, 'data');
const JSON_FILE = path.join(process.cwd(), 'bringx_data.json');
const CSV_FILE  = path.join(DATA_DIR, 'bringx_dataset.csv');

// CSV column headers
const CSV_HEADERS = [
  'StudentName',
  'Subject',
  'StudyHours',
  'Attendance',
  'PreviousMarks',
  'PredictedScore',
  'Passed',
  'Confidence',
  'OverallScore',
  'OverallPerformance',
  'CreatedAt',
].join(',');

// ── Types ─────────────────────────────────────────────────────
interface SubjectResult {
  subjectName:    string;
  studyHours:     number;
  attendance:     number;
  previousMarks:  number;
  predictedScore: number;
  passed:         boolean;
  confidence:     number;
}

interface BringxRecord {
  _id:                string;
  studentName:        string;
  subjects:           SubjectResult[];
  overallScore:       number;
  overallPerformance: 'Pass' | 'Fail';
  createdAt:          string;
}

// ── JSON helpers ──────────────────────────────────────────────
function readRecords(): BringxRecord[] {
  try {
    if (!fs.existsSync(JSON_FILE)) return [];
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8')) as BringxRecord[];
  } catch { return []; }
}

function writeRecords(records: BringxRecord[]): void {
  fs.writeFileSync(JSON_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// ── CSV helper ────────────────────────────────────────────────
function appendToCSV(record: BringxRecord): void {
  // Ensure data/ directory exists
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Write header if file doesn't exist yet
  const fileExists = fs.existsSync(CSV_FILE);
  const lines: string[] = [];

  if (!fileExists) lines.push(CSV_HEADERS);

  // One row per subject
  for (const sub of record.subjects) {
    const row = [
      `"${record.studentName}"`,
      `"${sub.subjectName}"`,
      sub.studyHours,
      sub.attendance,
      sub.previousMarks,
      sub.predictedScore.toFixed(1),
      sub.passed ? 'Pass' : 'Fail',
      sub.confidence.toFixed(1),
      record.overallScore,
      record.overallPerformance,
      `"${record.createdAt}"`,
    ].join(',');
    lines.push(row);
  }

  fs.appendFileSync(CSV_FILE, lines.join('\n') + '\n', 'utf-8');
  console.log(`[BRINGX] CSV updated → ${CSV_FILE}`);
}

// ── ID generator ──────────────────────────────────────────────
function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Flask ML prediction (fallback if Flask is down) ───────────
async function flaskPredict(hours: number, attendance: number, previous: number) {
  try {
    const res = await fetch(`${FLASK_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours, attendance, previous }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('Flask error');
    return await res.json();
  } catch {
    const score = Math.min(100, Math.round(hours * 4.2 + attendance * 0.22 + previous * 0.38));
    const prob  = Math.min(99, Math.round(50 + score * 0.4));
    return { predicted_marks: score, result: score >= 50 ? 'Pass' : 'Fail', probability: prob };
  }
}

// ════════════════════════════════════════════════════════════
//  POST /api/predict
// ════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, subjects } = body;

    if (!studentName || !subjects || subjects.length !== 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Get ML predictions for all 5 subjects
    const predictedSubjects: SubjectResult[] = await Promise.all(
      subjects.map(async (
        sub: { studyHours: number; attendance: number; previousMarks: number },
        i: number
      ) => {
        const pred = await flaskPredict(sub.studyHours, sub.attendance, sub.previousMarks);
        return {
          subjectName:    SUBJECTS[i],
          studyHours:     sub.studyHours,
          attendance:     sub.attendance,
          previousMarks:  sub.previousMarks,
          predictedScore: Math.round(pred.predicted_marks * 10) / 10,
          passed:         pred.result === 'Pass',
          confidence:     pred.probability,
        };
      })
    );

    const overallScore: number = Math.round(
      predictedSubjects.reduce((s, sub) => s + sub.predictedScore, 0) / predictedSubjects.length
    );
    const overallPerformance: 'Pass' | 'Fail' = overallScore >= 50 ? 'Pass' : 'Fail';

    const record: BringxRecord = {
      _id:                genId(),
      studentName:        studentName.trim(),
      subjects:           predictedSubjects,
      overallScore,
      overallPerformance,
      createdAt:          new Date().toISOString(),
    };

    // ── Save to JSON ──────────────────────────────────────────
    const existing = readRecords();
    existing.unshift(record);
    writeRecords(existing);

    // ── Save to CSV ───────────────────────────────────────────
    appendToCSV(record);

    return NextResponse.json({ success: true, record }, { status: 201 });

  } catch (err) {
    console.error('[BRINGX] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════
//  GET /api/predict  → return all saved records
// ════════════════════════════════════════════════════════════
export async function GET() {
  const records = readRecords();
  return NextResponse.json({
    records,
    storage: {
      json: JSON_FILE,
      csv:  CSV_FILE,
    },
  });
}
