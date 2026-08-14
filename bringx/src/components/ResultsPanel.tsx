'use client';
import { StudentRecord, SUBJECT_ICONS } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props { record: StudentRecord; }

export default function ResultsPanel({ record }: Props) {

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('BRINGX – Student Performance Report', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Student: ${record.studentName}`, 14, 32);
    doc.text(`Date: ${new Date(record.createdAt).toLocaleDateString()}`, 14, 39);
    doc.text(`Overall Score: ${record.overallScore}/100  |  Result: ${record.overallPerformance}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [['Subject', 'Study Hrs', 'Attendance', 'Prev. Marks', 'Predicted', 'Result', 'Confidence']],
      body: record.subjects.map(s => [
        s.subjectName,
        `${s.studyHours}h`,
        `${s.attendance}%`,
        `${s.previousMarks}/100`,
        `${s.predictedScore.toFixed(1)}/100`,
        s.passed ? 'PASS' : 'FAIL',
        `${s.confidence.toFixed(1)}%`,
      ]),
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      styles: { fontSize: 9 },
    });

    doc.save(`BRINGX_${record.studentName}_${new Date(record.createdAt).toLocaleDateString()}.pdf`);
  };

  const isPass = record.overallPerformance === 'Pass';

  return (
    <div className="space-y-6">

      {/* Overall card */}
      <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
        {/* Subtle top line */}
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />

        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#475569' }}>
          Overall Performance
        </p>
        <p className="text-7xl font-black text-white mb-3"
           style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>
          {record.overallScore}
          <span className="text-2xl font-normal" style={{ color: '#334155' }}>/100</span>
        </p>
        <span className="inline-block px-5 py-2 rounded-full text-sm font-bold"
              style={isPass
                ? { background: 'rgba(255,255,255,0.10)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.10)' }
              }>
          {isPass ? '✅ Pass' : '❌ Fail'}
        </span>
        <p className="text-xs mt-3" style={{ color: '#334155' }}>
          {record.subjects.filter(s => s.passed).length} of 5 subjects passed
        </p>
      </div>

      {/* Per-subject cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {record.subjects.map((sub, i) => (
          <div key={sub.subjectName}
               className="glass rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] relative overflow-hidden">
            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px"
                 style={{ background: sub.passed
                   ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                   : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{SUBJECT_ICONS[i]}</span>
              <span className="font-semibold text-sm text-white">{sub.subjectName}</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={sub.passed
                      ? { background: 'rgba(255,255,255,0.10)', color: '#e2e8f0' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#475569' }
                    }>
                {sub.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>

            <p className="text-3xl font-black text-white"
               style={{ textShadow: sub.passed ? '0 0 20px rgba(255,255,255,0.2)' : 'none' }}>
              {sub.predictedScore.toFixed(1)}
              <span className="text-sm font-normal" style={{ color: '#334155' }}>/100</span>
            </p>

            {/* Confidence bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: '#334155' }}>
                <span>Confidence</span>
                <span>{sub.confidence.toFixed(1)}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                     style={{
                       width: `${sub.confidence}%`,
                       background: sub.passed
                         ? 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.9))'
                         : 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
                     }} />
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1">
              {[
                { label: `${sub.studyHours}h`, icon: '⏱️' },
                { label: `${sub.attendance}%`, icon: '📅' },
                { label: `${sub.previousMarks}`, icon: '📝' },
              ].map(tag => (
                <span key={tag.label} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#475569' }}>
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PDF download — white button */}
      <button
        onClick={downloadPDF}
        className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200
                   hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff',
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)';
          (e.target as HTMLButtonElement).style.boxShadow  = '0 0 20px rgba(255,255,255,0.08)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.target as HTMLButtonElement).style.boxShadow  = 'none';
        }}>
        📄 Download PDF Report
      </button>
    </div>
  );
}
