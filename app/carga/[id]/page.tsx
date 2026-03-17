'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { currentConfig } from "@/lib/tenantConfig"; // CORREGIDO

export default function PlayerSelfServicePage() {
  const params = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [availableMetrics, setAvailableMetrics] = useState<any[]>([]);
  const [mode, setMode] = useState<'menu' | 'physical' | 'match'>('menu');
  const [isSaving, setIsSaving] = useState(false);

  // Estados Físico (Lista de registros)
  const [physRecords, setPhysRecords] = useState<{metric: string, value: string}[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [physDate, setPhysDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados Partido
  const [matchData, setMatchData] = useState({ date: new Date().toISOString().split('T')[0], minutes: '', tackles: '', tries: '', sensation: '5', notes: '' });

  useEffect(() => {
    fetch(`/api/players/${params.id}`).then(res => res.json()).then(setPlayer);
    fetch(`/api/metrics`).then(res => res.json()).then(data => {
      setAvailableMetrics(data);
      if(data.length > 0) setSelectedMetric(data[0].name);
    });
  }, [params.id]);

  const addPhysLine = () => {
    if(!currentValue) return;
    setPhysRecords([...physRecords, { metric: selectedMetric, value: currentValue }]);
    setCurrentValue("");
  };

  const removePhysLine = (index: number) => {
    setPhysRecords(physRecords.filter((_, i) => i !== index));
  };

  const savePhysical = async () => {
    if(physRecords.length === 0) return;
    setIsSaving(true);
    for (const record of physRecords) {
      await fetch(`/api/players/${params.id}/physical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, date: physDate }),
      });
    }
    alert("¡Entrenamiento guardado!");
    window.location.reload();
  };

  const saveMatch = async () => {
    setIsSaving(true);
    const res = await fetch(`/api/players/${params.id}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData),
    });
    if (res.ok) {
      alert("¡Partido guardado!");
      window.location.reload();
    }
  };

  if (!player) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 font-sans">
      {/* HEADER DINÁMICO */}
      <header className="text-center mb-10 pt-6 border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>
          {currentConfig.tenantName}
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
          Hola, <span className="text-[var(--color-primary)]">{player.firstName}</span>
        </p>
      </header>

      {/* MENÚ PRINCIPAL */}
      {mode === 'menu' && (
        <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
          <button 
            onClick={() => setMode('physical')} 
            className="bg-[var(--color-primary)] text-white h-40 rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-gray-200 active:scale-95 transition-all"
          >
            <span className="text-4xl mb-2">🏋️‍♂️</span>
            <span className="text-sm font-black uppercase tracking-widest text-white/90">Gimnasio / Test</span>
          </button>
          
          <button 
            onClick={() => setMode('match')} 
            className="bg-[var(--color-secondary)] text-white h-40 rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-gray-200 active:scale-95 transition-all"
          >
            <span className="text-4xl mb-2">🏉</span>
            <span className="text-sm font-black uppercase tracking-widest text-white/90">Cargar Partido</span>
          </button>
        </div>
      )}

      {/* MODO FÍSICO / GIMNASIO */}
      {mode === 'physical' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Fecha del entrenamiento</label>
            <input 
              type="date" 
              value={physDate} 
              onChange={e => setPhysDate(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl mt-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold text-sm" 
            />
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Agregar Ejercicio</label>
            <div className="flex gap-2">
              <select 
                value={selectedMetric} 
                onChange={e => setSelectedMetric(e.target.value)} 
                className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {availableMetrics.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
              <input 
                type="number" 
                placeholder="0" 
                value={currentValue} 
                onChange={e => setCurrentValue(e.target.value)} 
                className="w-20 bg-gray-50 border border-gray-100 p-3 rounded-xl text-center font-black text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              />
              <button 
                onClick={addPhysLine} 
                className="bg-[var(--color-primary)] text-white px-4 rounded-xl font-black shadow-sm"
              >+</button>
            </div>
          </div>

          {physRecords.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] font-black tracking-widest">
                  <tr><th className="p-4 text-left">Ejercicio</th><th className="p-4 text-center">Valor</th><th className="p-4"></th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {physRecords.map((r, i) => (
                    <tr key={i}>
                      <td className="p-4 font-bold text-gray-700 text-xs uppercase">{r.metric}</td>
                      <td className="p-4 text-center font-black text-[var(--color-primary)]">{r.value}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => removePhysLine(i)} className="text-red-300 font-black hover:text-red-500 uppercase text-[10px]">Quitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button onClick={() => setMode('menu')} className="flex-1 bg-white text-gray-400 p-4 rounded-2xl font-black uppercase text-[10px] border border-gray-100 tracking-widest">CANCELAR</button>
            <button 
              onClick={savePhysical} 
              disabled={physRecords.length === 0 || isSaving} 
              className="flex-[2] bg-[var(--color-primary)] text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 shadow-lg shadow-gray-200"
            >
              {isSaving ? 'GUARDANDO...' : 'GUARDAR TODO'}
            </button>
          </div>
        </div>
      )}

      {/* MODO PARTIDO */}
      {mode === 'match' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 max-w-md mx-auto">
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2 block">Fecha del Partido</label>
            <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest text-center block mb-2">Min</label>
              <input type="number" value={matchData.minutes} onChange={e => setMatchData({...matchData, minutes: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-center font-black text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div>
              <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest text-center block mb-2">Tackles</label>
              <input type="number" value={matchData.tackles} onChange={e => setMatchData({...matchData, tackles: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-center font-black text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div>
              <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest text-center block mb-2">Tries</label>
              <input type="number" value={matchData.tries} onChange={e => setMatchData({...matchData, tries: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-center font-black text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3 block">Sensación (1-10)</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={matchData.sensation} 
              onChange={e => setMatchData({...matchData, sensation: e.target.value})} 
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]" 
            />
            <div className="text-center font-black text-[var(--color-primary)] mt-3 text-xl">{matchData.sensation}</div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2 block">Notas</label>
            <textarea 
              placeholder="Notas, lesiones o golpes..." 
              value={matchData.notes} 
              onChange={e => setMatchData({...matchData, notes: e.target.value})} 
              className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl h-24 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-gray-300 font-medium"
            ></textarea>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setMode('menu')} className="flex-1 bg-white text-gray-400 p-4 rounded-2xl font-black uppercase text-[10px] border border-gray-100 tracking-widest">CANCELAR</button>
            <button 
              onClick={saveMatch} 
              disabled={isSaving} 
              className="flex-[2] bg-[var(--color-secondary)] text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-gray-200"
            >
              {isSaving ? 'GUARDANDO...' : 'GUARDAR PARTIDO'}
            </button>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
        {currentConfig.poweredByLabel}
      </footer>
    </div>
  );
}