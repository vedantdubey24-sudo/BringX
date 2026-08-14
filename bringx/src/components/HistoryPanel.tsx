'use client';
import { StudentRecord, SUBJECT_ICONS } from '@/types';
import { useState } from 'react';

interface Props {
  records: StudentRecord[];
  onSelect: (r: StudentRecord) => void;
}

export default function HistoryPanel({ records, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    r.studentName.toLowerCase().includes(search.toLowerCase())
  );

  if (records.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm" style={{ color: '#334155' }}>
          No history yet. Make a prediction first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🕒</span> Student History
        </h2>
        <span className="ml-auto text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
          {records.length} records
        </span>
      </div>

      <input
        type="text"
        placeholder="Search by name…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          caretColor: '#ffffff',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; }}
        onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      />

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map(record => (
          <button
            key={record._id}
            onClick={() => onSelect(record)}
            className="w-full glass rounded-xl p-4 text-left cursor-pointer
                       transition-all duration-200 hover:scale-[1.01]"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
              (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.03)';
            }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{record.studentName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
                  {new Date(record.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{record.overallScore}</p>
                <span className="text-xs font-bold"
                      style={{ color: record.overallPerformance === 'Pass' ? '#e2e8f0' : '#475569' }}>
                  {record.overallPerformance}
                </span>
              </div>
            </div>

            {/* Mini subject scores */}
            <div className="flex gap-3 flex-wrap">
              {record.subjects.map((sub, i) => (
                <div key={sub.subjectName} className="flex items-center gap-1 text-xs">
                  <span>{SUBJECT_ICONS[i]}</span>
                  <span style={{ color: sub.passed ? '#cbd5e1' : '#475569' }}>
                    {sub.predictedScore.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
