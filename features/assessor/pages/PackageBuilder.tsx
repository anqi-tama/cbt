
import React, { useState, useMemo } from 'react';
import { Question, KmsPackage, ExamSession, ExamStatus, QuestionType } from '../../../shared/types';
import { Card, Badge, Button, ProgressBar } from '../../../shared/ui';
import { DataTable, Column } from '../../../shared/ui/DataTable';

interface PackageBuilderProps {
  kmsPackages: KmsPackage[];
  cbtPackages: ExamSession[];
  onSync: () => void;
  onSave: (pkg: ExamSession) => void;
}

const PackageBuilder: React.FC<PackageBuilderProps> = ({ kmsPackages, cbtPackages, onSync, onSave }) => {
  const [view, setView] = useState<'LIST' | 'BUILDER' | 'KMS_DETAIL'>('LIST');
  const [selectedKmsForView, setSelectedKmsForView] = useState<KmsPackage | null>(null);
  const [kmsSearchTerm, setKmsSearchTerm] = useState('');
  const [showKeys, setShowKeys] = useState(false);

  // Builder States
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [targetLevel, setTargetLevel] = useState('MENENGAH');
  const [targetUser, setTargetUser] = useState('INTERNAL');
  
  const [selectedKmsIds, setSelectedKmsIds] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({ type: 'ALL', difficulty: 'ALL' });
  const [randomize, setRandomize] = useState({ questions: true, options: true });

  const handleViewKms = (pkg: KmsPackage) => {
    setSelectedKmsForView(pkg);
    setShowKeys(false); // Reset toggle when changing package
    setView('KMS_DETAIL');
  };

  // Helper to format answer with label if MCQ
  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);
  const formatAnswerWithLabel = (q: Question, answerValue: any) => {
    if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
      const idx = q.options.indexOf(String(answerValue));
      if (idx !== -1) return `${getOptionLabel(idx)}. ${answerValue}`;
    }
    return answerValue;
  };

  // Columns for the master data table
  const kmsColumns: Column<KmsPackage>[] = [
    { 
      header: 'Nama Paket KMS', 
      accessor: (p) => <span className="font-bold text-slate-800">{p.name}</span> 
    },
    { 
      header: 'Kategori Topik', 
      accessor: (p) => <Badge variant="neutral">{p.topic}</Badge> 
    },
    { 
      header: 'Total Soal', 
      accessor: 'totalQuestions',
      className: 'font-black text-slate-600'
    },
    { 
      header: 'Komposisi (E/M/H)', 
      accessor: (p) => (
        <div className="flex h-2 w-24 rounded-full overflow-hidden bg-slate-200">
          <div className="h-full bg-green-500" style={{ width: `${(p.composition.easy / p.totalQuestions) * 100}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${(p.composition.medium / p.totalQuestions) * 100}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${(p.composition.hard / p.totalQuestions) * 100}%` }} />
        </div>
      )
    },
    { 
      header: 'Sync Terakhir', 
      accessor: (p) => <span className="text-[10px] font-mono font-bold text-slate-400">{new Date(p.lastSync).toLocaleString()}</span> 
    },
    { 
      header: 'Aksi', 
      accessor: (p) => (
        <Button 
          variant="ghost" 
          onClick={() => handleViewKms(p)}
          className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
        >
          Tinjau Soal
        </Button>
      ),
      className: 'text-right'
    }
  ];

  // Dual List Logic
  const availableKms = useMemo(() => {
    return kmsPackages.filter(p => 
      !selectedKmsIds.includes(p.id) && 
      p.name.toLowerCase().includes(kmsSearchTerm.toLowerCase())
    );
  }, [kmsPackages, selectedKmsIds, kmsSearchTerm]);

  const selectedKmsList = useMemo(() => {
    return kmsPackages.filter(p => selectedKmsIds.includes(p.id));
  }, [kmsPackages, selectedKmsIds]);

  const addKms = (id: string) => {
    setSelectedKmsIds(prev => [...prev, id]);
  };

  const removeKms = (id: string) => {
    setSelectedKmsIds(prev => prev.filter(i => i !== id));
    setSelectedQuestions(prev => prev.filter(q => q.sourcePackageId !== id));
  };

  // Get all available questions from selected KMS packages
  const availableQuestions = useMemo(() => {
    return kmsPackages
      .filter(p => selectedKmsIds.includes(p.id))
      .flatMap(p => p.questions);
  }, [kmsPackages, selectedKmsIds]);

  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter(q => {
      const typeMatch = filters.type === 'ALL' || q.type === filters.type;
      const diffMatch = filters.difficulty === 'ALL' || q.difficulty === filters.difficulty;
      return typeMatch && diffMatch;
    });
  }, [availableQuestions, filters]);

  // Composition Stats
  const stats = useMemo(() => {
    const list = view === 'KMS_DETAIL' && selectedKmsForView ? selectedKmsForView.questions : selectedQuestions;
    const total = list.length || 1;
    const easy = list.filter(q => q.difficulty === 'EASY').length;
    const medium = list.filter(q => q.difficulty === 'MEDIUM').length;
    const hard = list.filter(q => q.difficulty === 'HARD').length;
    const totalWeight = list.reduce((acc, q) => acc + q.weight, 0);

    return {
      easyPct: (easy / total) * 100,
      mediumPct: (medium / total) * 100,
      hardPct: (hard / total) * 100,
      totalWeight,
      count: list.length
    };
  }, [selectedQuestions, view, selectedKmsForView]);

  const toggleQuestion = (q: Question) => {
    const exists = selectedQuestions.find(sq => sq.id === q.id);
    if (exists) {
      setSelectedQuestions(prev => prev.filter(sq => sq.id !== q.id));
    } else {
      setSelectedQuestions(prev => [...prev, q]);
    }
  };

  const handleSavePackage = () => {
    if (!newPkgName || selectedQuestions.length === 0) return;

    const pkg: ExamSession = {
      id: `cbt-pkg-${Date.now()}`,
      title: newPkgName,
      description: `${newPkgDesc} | Level: ${targetLevel} | Target: ${targetUser}`,
      startTime: '',
      endTime: '',
      durationMinutes: duration,
      status: ExamStatus.DRAFT,
      questions: selectedQuestions,
      config: {
        randomizeQuestions: randomize.questions,
        randomizeOptions: randomize.options,
        showResultsImmediately: false
      }
    };
    onSave(pkg);
    setView('LIST');
    resetBuilder();
  };

  const resetBuilder = () => {
    setNewPkgName('');
    setNewPkgDesc('');
    setDuration(60);
    setTargetLevel('MENENGAH');
    setTargetUser('INTERNAL');
    setSelectedKmsIds([]);
    setSelectedQuestions([]);
    setKmsSearchTerm('');
  };

  if (view === 'KMS_DETAIL' && selectedKmsForView) {
    return (
      <div className="flex flex-col gap-8 pb-20 animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20 py-4 -mx-2 px-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('LIST')} className="hover:bg-slate-100">
              ← Kembali
            </Button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedKmsForView.name}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Detail Paket Sumber (Read-Only)</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lihat Kunci Jawaban</p>
              <button 
                onClick={() => setShowKeys(!showKeys)}
                className={`w-12 h-6 rounded-full transition-all relative ${showKeys ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${showKeys ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <Badge variant="info" className="py-2 px-6 text-sm">{selectedKmsForView.topic}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-8 space-y-10">
            <Card className="p-8">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-3 mb-8">Daftar Pertanyaan dalam Paket</h3>
              <div className="space-y-12">
                {selectedKmsForView.questions.map((q, idx) => (
                  <div key={q.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm relative hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">{idx + 1}</span>
                        <Badge variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'danger'}>
                          {q.difficulty}
                        </Badge>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bobot Skor</p>
                        <p className="text-lg font-black text-indigo-600">{q.weight}</p>
                      </div>
                    </div>
                    
                    <p className="text-xl font-bold text-slate-800 leading-relaxed mb-6">{q.text}</p>
                    
                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {q.options.map((opt, i) => (
                          <div key={i} className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                            <span className="text-indigo-400 mr-2">{getOptionLabel(i)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {showKeys && q.correctAnswer && (
                      <div className="mt-8 p-6 bg-indigo-50/40 border-2 border-indigo-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          KUNCI JAWABAN
                        </p>
                        <div className="text-sm font-black text-indigo-800 leading-relaxed uppercase bg-white/50 p-3 rounded-lg border border-indigo-100/50">
                          {formatAnswerWithLabel(q, q.correctAnswer)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 sticky top-24">
            <Card className="p-8 space-y-8 shadow-2xl border-indigo-100 rounded-[2rem]">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Statistik Paket
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-200">
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Total Soal</p>
                    <p className="text-3xl font-black">{stats.count}</p>
                  </div>
                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[1.5rem]">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Akumulasi Bobot</p>
                    <p className="text-3xl font-black text-indigo-700">{stats.totalWeight}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Komposisi Kesulitan</h4>
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-green-600">Mudah</span>
                      <span className="text-slate-400">{Math.round(stats.easyPct)}%</span>
                    </div>
                    <ProgressBar value={stats.easyPct} color="bg-green-500" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-amber-500">Sedang</span>
                      <span className="text-slate-400">{Math.round(stats.mediumPct)}%</span>
                    </div>
                    <ProgressBar value={stats.mediumPct} color="bg-amber-500" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-red-500">Sulit</span>
                      <span className="text-slate-400">{Math.round(stats.hardPct)}%</span>
                    </div>
                    <ProgressBar value={stats.hardPct} color="bg-red-500" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed uppercase text-center px-4">
                  Data ini disinkronisasi langsung dari Knowledge Management System (KMS). Perubahan pada sumber akan berdampak pada sinkronisasi berikutnya.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'BUILDER') {
    return (
      <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20 py-2 -mx-2 px-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('LIST')} className="hover:bg-slate-200">
              ← Kembali
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Paket Ujian Baru</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Langkah: Konfigurasi & Kurasi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="secondary" onClick={resetBuilder} disabled={selectedQuestions.length === 0 && !newPkgName}>
                Reset
             </Button>
             <Button variant="indigo" onClick={handleSavePackage} disabled={selectedQuestions.length === 0 || !newPkgName}>
                Simpan Paket (Draft)
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <Card className="p-6 space-y-6">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest border-b pb-2">1. Informasi Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Paket Ujian</label>
                  <input 
                    type="text" 
                    value={newPkgName}
                    onChange={e => setNewPkgName(e.target.value)}
                    placeholder="Contoh: UTS Jaringan Komputer 2024"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
                  <input 
                    type="text" 
                    value={newPkgDesc}
                    onChange={e => setNewPkgDesc(e.target.value)}
                    placeholder="Keterangan tambahan untuk pengawas atau peserta..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Waktu Pengerjaan</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={duration}
                      onChange={e => setDuration(parseInt(e.target.value) || 0)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 pr-16"
                    />
                    <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 uppercase">Menit</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Level Soal</label>
                  <select 
                    value={targetLevel}
                    onChange={e => setTargetLevel(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  >
                    <option value="DASAR">DASAR (Basic)</option>
                    <option value="MENENGAH">MENENGAH (Intermediate)</option>
                    <option value="LANJUT">LANJUT (Advanced)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pengguna Soal</label>
                  <select 
                    value={targetUser}
                    onChange={e => setTargetUser(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  >
                    <option value="INTERNAL">INTERNAL (Karyawan/Siswa)</option>
                    <option value="REKRUTMEN">REKRUTMEN (Calon Peserta)</option>
                    <option value="SERTIFIKASI_EKSTERNAL">SERTIFIKASI EKSTERNAL</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest">2. Pilih Sumber Paket KMS</h3>
                <Badge variant="neutral">{selectedKmsIds.length} Sumber Terpilih</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
                <div className="flex flex-col gap-3 h-full overflow-hidden">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Cari paket KMS..."
                      value={kmsSearchTerm}
                      onChange={e => setKmsSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                  </div>
                  <div className="flex-1 overflow-y-auto border rounded-xl p-2 bg-slate-50/50 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Tersedia di KMS</p>
                    {availableKms.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        {kmsSearchTerm ? 'Tidak ditemukan paket yang sesuai.' : 'Semua paket telah terpilih.'}
                      </div>
                    ) : (
                      availableKms.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => addKms(p.id)}
                          className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{p.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{p.totalQuestions} Soal • {p.topic}</span>
                          </div>
                          <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all font-bold">+</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 h-full overflow-hidden">
                  <div className="py-2.5 px-4 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700">
                    Sumber Paket Terpilih
                  </div>
                  <div className="flex-1 overflow-y-auto border border-indigo-100 rounded-xl p-2 bg-indigo-50/20 space-y-2">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1 mb-2">Akan Digunakan</p>
                    {selectedKmsList.length === 0 ? (
                      <div className="py-8 text-center text-slate-300 text-xs italic">
                        Belum ada sumber yang dipilih.
                      </div>
                    ) : (
                      selectedKmsList.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => removeKms(p.id)}
                          className="w-full flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-lg hover:border-red-300 hover:bg-red-50/30 transition-all text-left group"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-indigo-700 group-hover:text-red-600 transition-colors">{p.name}</span>
                            <span className="text-[10px] text-indigo-400 group-hover:text-red-400 transition-colors uppercase tracking-tighter">{p.totalQuestions} Soal • {p.topic}</span>
                          </div>
                          <span className="text-red-400 opacity-0 group-hover:opacity-100 transition-all font-bold">×</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between sticky top-20 bg-slate-50 py-4 z-10">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest border-b-2 border-indigo-500 pb-1">3. Kurasi & Seleksi Soal</h3>
                <div className="flex gap-2">
                  <div className="flex bg-white rounded-lg border p-1">
                    <select 
                      className="text-[10px] font-bold uppercase bg-transparent px-2 outline-none border-r text-slate-800"
                      onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="ALL">Semua Tipe</option>
                      <option value={QuestionType.MULTIPLE_CHOICE}>Pilihan Ganda</option>
                      <option value={QuestionType.ESSAY}>Essay</option>
                    </select>
                    <select 
                      className="text-[10px] font-bold uppercase bg-transparent px-2 outline-none text-slate-800"
                      onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}
                    >
                      <option value="ALL">Semua Tingkat</option>
                      <option value="EASY">Mudah</option>
                      <option value="MEDIUM">Sedang</option>
                      <option value="HARD">Sulit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredQuestions.length === 0 && (
                  <div className="py-24 text-center text-slate-400 italic bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3">
                    <span className="text-4xl opacity-20">📂</span>
                    <p className="max-w-xs mx-auto">Silakan pilih minimal satu sumber KMS pada Langkah 2 untuk menampilkan daftar soal yang tersedia.</p>
                  </div>
                )}
                {filteredQuestions.map(q => (
                  <Card 
                    key={q.id} 
                    className={`
                      p-5 border-2 transition-all cursor-pointer group
                      ${selectedQuestions.find(sq => sq.id === q.id) 
                        ? 'border-indigo-500 bg-indigo-50/30 shadow-md ring-1 ring-indigo-100' 
                        : 'border-transparent hover:border-slate-200'}
                    `}
                    onClick={() => toggleQuestion(q)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'danger'}>
                          {q.difficulty}
                        </Badge>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {q.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Bobot Skor</p>
                          <p className="text-sm font-black text-slate-700">{q.weight}</p>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                          ${selectedQuestions.find(sq => sq.id === q.id) 
                            ? 'bg-indigo-600 border-indigo-600 rotate-0' 
                            : 'border-slate-200 group-hover:border-slate-300 rotate-12'}
                        `}>
                          {selectedQuestions.find(sq => sq.id === q.id) && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed pr-8">{q.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24">
            <Card className="p-6 flex flex-col gap-8 shadow-xl border-indigo-100 bg-white ring-1 ring-slate-100">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Ringkasan Komposisi
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Total Soal</p>
                    <p className="text-3xl font-black">{stats.count}</p>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bobot</p>
                    <p className="text-3xl font-black text-slate-800">{stats.totalWeight}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-green-600">Mudah (Easy)</span>
                    <span className="text-slate-400">{Math.round(stats.easyPct)}%</span>
                  </div>
                  <ProgressBar value={stats.easyPct} color="bg-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-amber-500">Sedang (Medium)</span>
                    <span className="text-slate-400">{Math.round(stats.mediumPct)}%</span>
                  </div>
                  <ProgressBar value={stats.mediumPct} color="bg-amber-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-red-500">Sulit (Hard)</span>
                    <span className="text-slate-400">{Math.round(stats.hardPct)}%</span>
                  </div>
                  <ProgressBar value={stats.hardPct} color="bg-red-500" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keamanan & Integritas</h4>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <input 
                      type="checkbox" 
                      checked={randomize.questions} 
                      onChange={e => setRandomize(r => ({ ...r, questions: e.target.checked }))}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Acak Urutan Soal</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">Setiap peserta akan menerima urutan pertanyaan yang berbeda untuk meminimalkan kecurangan.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <input 
                      type="checkbox" 
                      checked={randomize.options} 
                      onChange={e => setRandomize(r => ({ ...r, options: e.target.checked }))}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Acak Pilihan Jawaban</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">Urutan pilihan A, B, C, D akan diacak secara dinamis bagi setiap peserta (Berlaku untuk Pilihan Ganda).</p>
                    </div>
                  </label>
                </div>
              </div>

              {stats.count === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-[10px] font-bold text-amber-700 uppercase leading-tight">Paket belum bisa disimpan. Pilih minimal 1 soal.</p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <p className="text-[10px] font-bold text-green-700 uppercase leading-tight">Konfigurasi Valid. Siap untuk disimpan sebagai Draft.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-slate-200 rounded-xl">
          <button className="px-6 py-2 bg-white rounded-lg text-sm font-bold shadow-sm text-indigo-600 transition-all">Daftar Paket</button>
          <button className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all">Riwayat Sinkronisasi</button>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-slate-500 border border-slate-200 bg-white hover:bg-slate-50" onClick={onSync}>
            Sync from KMS 🔄
          </Button>
          <Button variant="indigo" onClick={() => setView('BUILDER')} className="shadow-lg shadow-indigo-200">
            Buat Paket Ujian Baru +
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          Paket Soal Sumber (KMS)
          <Badge variant="info">Single Source of Truth</Badge>
        </h3>
        
        <DataTable 
          data={kmsPackages} 
          columns={kmsColumns} 
          searchPlaceholder="Cari berdasarkan nama atau topik KMS..." 
          searchKey="name"
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Paket Ujian CBT (Dibuat Asesor)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cbtPackages.map(pkg => (
            <Card key={pkg.id} className="p-6 border-l-4 border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
               <div className="flex justify-between items-start mb-4">
                 <h4 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-indigo-600">{pkg.title}</h4>
                 <Badge variant={pkg.status === ExamStatus.DRAFT ? 'neutral' : 'success'}>{pkg.status}</Badge>
               </div>
               <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8">{pkg.description || 'Tidak ada deskripsi tambahan.'}</p>
               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest bg-slate-50 p-2 rounded-lg">
                 <span className="flex items-center gap-1">📑 {pkg.questions.length} Soal</span>
                 <span className="opacity-30">|</span>
                 <span className="flex items-center gap-1">⏱️ {pkg.durationMinutes} Menit</span>
               </div>
               <div className="flex gap-3">
                 <Button variant="secondary" className="text-[10px] uppercase font-bold tracking-widest px-4" fullWidth>Edit Paket</Button>
                 <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest px-4 border border-slate-200" fullWidth>Assign Event</Button>
               </div>
            </Card>
          ))}
          {cbtPackages.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
              <span className="text-5xl opacity-10">📝</span>
              <p className="max-w-xs font-medium">Belum ada paket ujian CBT yang dibuat. Gunakan tombol "Buat Paket Ujian Baru" untuk memulai komposisi soal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageBuilder;
