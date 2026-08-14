'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SubjectCard from '@/components/SubjectCard';
import ResultsPanel from '@/components/ResultsPanel';
import HistoryPanel from '@/components/HistoryPanel';
import { SubjectInput, StudentRecord, SUBJECTS, SUBJECT_COLORS, defaultSubjectInput } from '@/types';

const ChartsDashboard = dynamic(() => import('@/components/ChartsDashboard'), { ssr: false });

type Tab = 'predict' | 'results' | 'history';

export default function Home() {
  const [tab, setTab]               = useState<Tab>('predict');
  const [studentName, setStudentName] = useState('');
  const [inputs, setInputs]         = useState<SubjectInput[]>(SUBJECTS.map(() => defaultSubjectInput()));
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [result, setResult]         = useState<StudentRecord | null>(null);
  const [history, setHistory]       = useState<StudentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res  = await fetch('/api/predict');
      const data = await res.json();
      setHistory(data.records || []);
    } catch { /* silently ignore */ }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleInputChange = (idx: number, field: keyof SubjectInput, val: number) => {
    setInputs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const validate = (): string | null => {
    if (!studentName.trim()) return 'Please enter the student name.';
    for (let i = 0; i < 5; i++) {
      const s = inputs[i];
      if (s.studyHours   < 0 || s.studyHours   > 24)  return `${SUBJECTS[i]}: Study hours must be 0–24.`;
      if (s.attendance   < 0 || s.attendance   > 100) return `${SUBJECTS[i]}: Attendance must be 0–100.`;
      if (s.previousMarks < 0 || s.previousMarks > 100) return `${SUBJECTS[i]}: Previous marks must be 0–100.`;
    }
    return null;
  };

  const handlePredict = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/predict', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ studentName: studentName.trim(), subjects: inputs }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Prediction failed.'); return; }
      setResult(data.record);
      setTab('results');
      loadHistory();
    } catch {
      setError('Cannot connect to server. Make sure Flask is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'predict', label: 'Predict', icon: '🔮' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'history', label: 'History', icon: '🕒' },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-6xl mx-auto">

      {/* ── HEADER ─────────────────────────────────── */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs
                        font-semibold uppercase tracking-widest border"
             style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', color: '#cbd5e1' }}>
          🤖 AI-Powered &nbsp;·&nbsp; 5-Subject ML Predictor
        </div>

        {/* Shiny animated title */}
        <h1 className="text-6xl md:text-8xl font-black grad-text mb-4 tracking-tight">
          BRINGX
        </h1>

        <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#64748b' }}>
          Enter your details across all 5 subjects. Our ML models instantly predict your
          expected score and Pass / Fail outcome for each subject.
        </p>
      </header>

      {/* ── TABS ──────────────────────────────────── */}
      <div className="flex justify-center gap-2 mb-8">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                       transition-all duration-200 cursor-pointer"
            style={tab === t.id
              ? { background: '#ffffff', color: '#000000', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#64748b' }
            }>
            {t.icon} {t.label}
            {t.id === 'history' && history.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.3)', color: '#000' }}>
                {history.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── PREDICT TAB ───────────────────────────── */}
      {tab === 'predict' && (
        <div className="slide-up space-y-6">
          {/* Student name */}
          <div className="glass rounded-2xl p-5">
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2"
                   style={{ color: '#475569' }}>
              👤 Student Name
            </label>
            <input
              type="text"
              placeholder="Enter student full name…"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-base outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                caretColor: '#ffffff',
              }}
            />
          </div>

          {/* 5-Subject cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SUBJECTS.map((subj, i) => (
              <SubjectCard
                key={subj}
                subject={subj}
                index={i}
                color={SUBJECT_COLORS[i]}
                icon={''}
                value={inputs[i]}
                onChange={handleInputChange}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm"
                 style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit button — white on black */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-base cursor-pointer
                       transition-all duration-300 hover:-translate-y-1 relative overflow-hidden
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{
              background: '#ffffff',
              color: '#000000',
              boxShadow: loading ? 'none' : '0 0 40px rgba(255,255,255,0.15), 0 4px 20px rgba(255,255,255,0.1)',
            }}>
            <span className="flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                  Analysing 5 Subjects…
                </>
              ) : (
                <>🔮 Predict All Subjects</>
              )}
            </span>
          </button>
        </div>
      )}

      {/* ── RESULTS TAB ───────────────────────────── */}
      {tab === 'results' && (
        <div className="slide-up">
          {result ? (
            <div className="space-y-8">
              {/* Student info bar */}
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: '#475569' }}>Report for</p>
                  <p className="font-bold text-white text-lg">{result.studentName}</p>
                </div>
                <p className="text-xs" style={{ color: '#334155' }}>
                  {new Date(result.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <ResultsPanel record={result} />
              <ChartsDashboard record={result} />
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-5xl mb-4">🎯</p>
              <p style={{ color: '#475569' }}>
                No prediction yet. Go to{' '}
                <strong className="text-white">Predict</strong> tab first!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ───────────────────────────── */}
      {tab === 'history' && (
        <div className="slide-up">
          {historyLoading ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
                   style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#fff' }} />
              <p className="text-sm" style={{ color: '#475569' }}>Loading records…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistoryPanel
                records={history}
                onSelect={r => { setResult(r); setTab('results'); }}
              />
              {history.length >= 2 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-4"
                      style={{ color: '#475569' }}>
                    📈 Overall Score Trend
                  </h3>
                  <div className="space-y-3">
                    {history.slice(0, 10).map(r => (
                      <div key={r._id} className="flex items-center gap-3">
                        <span className="text-xs w-20 shrink-0 truncate" style={{ color: '#475569' }}>
                          {r.studentName}
                        </span>
                        <div className="flex-1 rounded-full h-2 overflow-hidden"
                             style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                               style={{
                                 width: `${r.overallScore}%`,
                                 background: r.overallPerformance === 'Pass'
                                   ? 'linear-gradient(90deg,rgba(255,255,255,0.4),rgba(255,255,255,0.9))'
                                   : 'linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.3))',
                               }} />
                        </div>
                        <span className="text-xs font-bold text-white w-8 text-right">
                          {r.overallScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── FOOTER ────────────────────────────────── */}
      <footer className="mt-20 text-center text-xs space-y-1" style={{ color: '#1e293b' }}>
        <p>BRINGX &nbsp;·&nbsp; AI-Powered Student Performance Predictor</p>
        <p>Linear Regression + Logistic Regression &nbsp;·&nbsp; Python Flask · Next.js</p>
      </footer>
    </div>
  );
}
