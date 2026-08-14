'use client';
import { SubjectInput, SUBJECT_ICONS } from '@/types';

interface Props {
  subject: string;
  index: number;
  color: string;
  icon: string;
  value: SubjectInput;
  onChange: (index: number, field: keyof SubjectInput, val: number) => void;
}

export default function SubjectCard({ subject, index, value, onChange }: Props) {
  const fields: { key: keyof SubjectInput; label: string; placeholder: string; max: number; step: number }[] = [
    { key: 'studyHours',    label: 'Study Hours / Day', placeholder: 'e.g. 6',  max: 24,  step: 0.5 },
    { key: 'attendance',    label: 'Attendance (%)',     placeholder: 'e.g. 85', max: 100, step: 1   },
    { key: 'previousMarks', label: 'Previous Marks',     placeholder: 'e.g. 72', max: 100, step: 1   },
  ];

  return (
    <div className="glass rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
         style={{ borderColor: 'rgba(255,255,255,0.12)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
             style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {SUBJECT_ICONS[index]}
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">{subject}</h3>
          <p className="text-xs" style={{ color: '#334155' }}>Subject {index + 1} of 5</p>
        </div>
        {/* White dot indicator */}
        <div className="ml-auto w-1.5 h-1.5 rounded-full"
             style={{ background: 'rgba(255,255,255,0.4)' }} />
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1"
                   style={{ color: '#334155' }}>
              {f.label}
            </label>
            <input
              type="number"
              min={0}
              max={f.max}
              step={f.step}
              placeholder={f.placeholder}
              value={value[f.key] || ''}
              onChange={e => onChange(index, f.key, parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none
                         transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                caretColor: '#ffffff',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.35)';
                e.target.style.background  = 'rgba(255,255,255,0.07)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.background  = 'rgba(255,255,255,0.04)';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
