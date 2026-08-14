'use client';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { StudentRecord, SUBJECT_COLORS } from '@/types';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

// Monochrome white palette for bars
const WHITE_SHADES = [
  'rgba(255,255,255,0.85)',
  'rgba(255,255,255,0.65)',
  'rgba(255,255,255,0.48)',
  'rgba(255,255,255,0.32)',
  'rgba(255,255,255,0.18)',
];

const scaleStyle = {
  ticks: { color: '#334155', font: { family: 'Inter', size: 10 as const } },
  grid:  { color: 'rgba(255,255,255,0.04)' },
};

const legendStyle = {
  labels: { color: '#475569', font: { family: 'Inter', size: 10 as const } },
};

interface Props { record: StudentRecord; }

export default function ChartsDashboard({ record }: Props) {
  const labels = record.subjects.map(s => s.subjectName);
  const scores = record.subjects.map(s => s.predictedScore);
  const prev   = record.subjects.map(s => s.previousMarks);
  const passCount = record.subjects.filter(s => s.passed).length;
  const failCount = 5 - passCount;

  const barData = {
    labels,
    datasets: [
      {
        label: 'Predicted Score',
        data: scores,
        backgroundColor: WHITE_SHADES,
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Previous Marks',
        data: prev,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Predicted Score',
        data: scores,
        borderColor: 'rgba(255,255,255,0.8)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: 'Previous Marks',
        data: prev,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(255,255,255,0.4)',
        pointRadius: 3,
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [passCount, failCount],
      backgroundColor: ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.12)'],
      borderColor: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)'],
      borderWidth: 1,
    }],
  };

  const attData = {
    labels,
    datasets: [{
      data: record.subjects.map(s => s.attendance),
      backgroundColor: WHITE_SHADES,
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
    }],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: legendStyle },
    scales: { x: scaleStyle, y: scaleStyle },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: legendStyle },
  };

  const chartCard = (title: string, children: React.ReactNode) => (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#334155' }}>
        {title}
      </h3>
      <div className="h-56">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <span>📊</span> Analytics Dashboard
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {chartCard('📊 Subject-wise Scores',     <Bar     data={barData}  options={baseOptions} />)}
        {chartCard('📈 Performance Trend',        <Line    data={lineData} options={baseOptions} />)}
        {chartCard('🥧 Pass vs Fail',             <Pie     data={pieData}  options={pieOptions}  />)}
        {chartCard('📅 Attendance by Subject',    <Doughnut data={attData} options={pieOptions}  />)}
      </div>
    </div>
  );
}
