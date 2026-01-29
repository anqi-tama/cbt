
import React from 'react';
import { Submission, ExamSession } from '../../../shared/types';
import { Card, Badge, Button } from '../../../shared/ui';

interface AssessorDashboardProps {
  submissions: Submission[];
  exams: ExamSession[];
  onSelectSubmission: (sub: Submission) => void;
}

const AssessorDashboard: React.FC<AssessorDashboardProps> = ({ submissions, exams, onSelectSubmission }) => {
  const pendingCount = submissions.filter(s => s.status !== 'COMPLETED').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Assessor Overview</h1>
          <p className="text-slate-500">Anda memiliki {pendingCount} antrian penilaian yang memerlukan tindakan.</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-6 py-2 flex items-center gap-3 bg-white">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-600">Sistem Grading: ONLINE</span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-indigo-600 text-white border-none">
          <p className="text-indigo-100 text-sm font-bold uppercase">Total Peserta</p>
          <h3 className="text-4xl font-black mt-2">{submissions.length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-slate-400 text-sm font-bold uppercase">Menunggu Penilaian</p>
          <h3 className="text-4xl font-black mt-2 text-amber-500">{pendingCount}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-slate-400 text-sm font-bold uppercase">Rata-rata Skor</p>
          <h3 className="text-4xl font-black mt-2 text-slate-800">84.2</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Antrian Penilaian Terbaru</h3>
          <Card className="divide-y overflow-hidden">
            {submissions.map(sub => (
              <div 
                key={sub.id} 
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelectSubmission(sub)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {sub.candidateName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{sub.candidateName}</p>
                    <p className="text-xs text-slate-500">ID: {sub.id} • Ujian: {exams.find(e => e.id === sub.examId)?.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={sub.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {sub.status}
                  </Badge>
                  <Button variant="ghost" className="px-3 py-1">Tinjau →</Button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Jadwal Ujian</h3>
          <div className="space-y-4">
            {exams.map(exam => (
              <Card key={exam.id} className="p-4">
                <p className="font-bold text-slate-700 line-clamp-1">{exam.title}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                  <Badge variant="info">{exam.durationMinutes}m</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessorDashboard;
