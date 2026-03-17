'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { currentConfig } from "@/lib/tenantConfig";

export default function PlayerSelfServicePage() {
  const params = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [availableMetrics, setAvailableMetrics] = useState<any[]>([]);
  const [mode, setMode] = useState<'menu' | 'physical' | 'match'>('menu');
  const [isSaving, setIsSaving] = useState(false);

  const [physRecords, setPhysRecords] = useState<{metric: string, value: string, unit: string}[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [physDate, setPhysDate] = useState(new Date().toISOString().split('T')[0]);

  const [matchData, setMatchData] = useState<any>({ date: new Date().toISOString().split('T')[0], minutes: 80, tackles: 0, tries: 0, sensation: 5, notes: '' });

  useEffect(() => {
    fetch(`/api/players/${params.id}`).then(res => res.json()).then(setPlayer);
    fetch(`/api/metrics`).then(res => res.json()).then(data => {
      setAvailableMetrics(data);
      if(data.length > 0) setSelectedMetricId(data[0].id);
    });
  }, [params.id]);

  const currentMetricObj = availableMetrics.find(m => m.id === selectedMetricId);

  const addPhysLine = () => {
    if(!currentValue || !currentMetricObj) return;
    setPhysRecords([...physRecords, { metric: currentMetricObj.name, value: currentValue, unit: currentMetricObj.unit }]);
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
        body: JSON.stringify({ metric: record.metric, value: parseFloat(record.value), date: physDate }),
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

  const updateMatchVal = (field: string, delta: number) => {
    setMatchData((prev: any) => ({ ...prev, [field]: Math.max(0, (parseInt(prev[field]) || 0) + delta) }));
  };

  if (!player) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-bold uppercase text-xs tracking-widest">Sincronizando Atleta...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 font-sans max-w-md mx-auto">
      <header className="text-center mb-10 pt-6 border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>{currentConfig.tenantName}</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Hola, <span className="text-[var(--color-primary)]">{player.firstName}</span></p>
      </header>

      {mode === 'menu' && (
        <div className="grid grid-cols-1 gap-6">
          <button onClick={() => setMode('physical')} className="bg-[var(--color-primary)] text-[var(--color-secondary)] h-40 rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all">
            <span className="text-4xl mb-2">🏋️‍♂️</span>
            <span className="text-sm font-black uppercase tracking-widest">Gimnasio / Test</span>
          </button>
          <button onClick={() => setMode('match')} className="bg-[var(--color-secondary)] text-white h-40 rounded-3xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all">
            <span className="text-4xl mb-2">🏉</span>
            <span className="text-sm font-black uppercase tracking-widest">Cargar Partido</span>
          </button>
        </div>
      )}

      {mode === 'physical' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Nueva Medición</label>
            <div className="flex gap-2">
              <select value={selectedMetricId} onChange={e => setSelectedMetricId(e.target.value)} className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                {availableMetrics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div className="relative w-24">
                <input type="number" placeholder="0" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-center font-black text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                <span className="absolute -top-2 -right-1 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">{currentMetricObj?.unit || '--'}</span>
              </div>
              <button onClick={addPhysLine} className="bg-[var(--color-primary)] text-[var(--color-secondary)] px-4 rounded-xl font-black shadow-sm">+</button>
            </div>
          </div>
          {physRecords.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {physRecords.map((r, i) => (
                    <tr key={i}>
                      <td className="p-4 font-bold text-gray-700 text-xs uppercase text-left">{r.metric}</td>
                      <td className="p-4 text-center font-black text-[var(--color-primary)]">{r.value} <span className="text-[9px] text-gray-300 ml-1">{r.unit}</span></td>
                      <td className="p-4 text-right"><button onClick={() => removePhysLine(i)} className="text-red-300 font-black uppercase text-[10px]">X</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setMode('menu')} className="flex-1 bg-white text-gray-400 p-4 rounded-2xl font-black uppercase text-[10px] border border-gray-100">VOLVER</button>
            <button onClick={savePhysical} disabled={physRecords.length === 0 || isSaving} className="flex-[2] bg-[var(--color-primary)] text-[var(--color-secondary)] p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">GUARDAR TODO</button>
          </div>
        </div>
      )}

      {mode === 'match' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <label className="text-[10px] text-gray-400 uppercase font-black block mb-3">Tackles</label>
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                  <button onClick={() => updateMatchVal('tackles', -1)} className="w-10 h-10 bg-white rounded-xl shadow-sm font-black text-xl">-</button>
                  <span className="text-2xl font-black text-[var(--color-primary)]">{matchData.tackles}</span>
                  <button onClick={() => updateMatchVal('tackles', 1)} className="w-10 h-10 bg-[var(--color-primary)] text-[var(--color-secondary)] rounded-xl shadow-sm font-black text-xl">+</button>
                </div>
              </div>
              <div className="text-center">
                <label className="text-[10px] text-gray-400 uppercase font-black block mb-3">Tries</label>
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                  <button onClick={() => updateMatchVal('tries', -1)} className="w-10 h-10 bg-white rounded-xl shadow-sm font-black text-xl">-</button>
                  <span className="text-2xl font-black text-[var(--color-primary)]">{matchData.tries}</span>
                  <button onClick={() => updateMatchVal('tries', 1)} className="w-10 h-10 bg-[var(--color-primary)] text-[var(--color-secondary)] rounded-xl shadow-sm font-black text-xl">+</button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black block mb-2 text-center">Minutos Jugados</label>
              <input type="number" value={matchData.minutes} onChange={e => setMatchData({...matchData, minutes: e.target.value})} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-black text-center text-lg outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMode('menu')} className="flex-1 bg-white text-gray-400 p-4 rounded-2xl font-black uppercase text-[10px] border border-gray-100">CANCELAR</button>
            <button onClick={saveMatch} disabled={isSaving} className="flex-[2] bg-[var(--color-secondary)] text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">FINALIZAR REPORTE</button>
          </div>
        </div>
      )}
    </div>
  );
}