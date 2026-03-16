'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

  if (!player) return <div className="p-8 text-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 font-sans">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-2xl font-black text-blue-500 uppercase italic">Scrum Manager</h1>
        <p className="text-gray-400">Hola, <span className="text-white font-bold">{player.firstName}</span></p>
      </header>

      {mode === 'menu' && (
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setMode('physical')} className="bg-orange-600 h-32 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all">
            <span className="text-3xl">🏋️‍♂️</span>
            <span className="text-xl font-bold mt-2 uppercase">Gimnasio / Test</span>
          </button>
          <button onClick={() => setMode('match')} className="bg-blue-600 h-32 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all">
            <span className="text-3xl">🏉</span>
            <span className="text-xl font-bold mt-2 uppercase">Cargar Partido</span>
          </button>
        </div>
      )}

      {mode === 'physical' && (
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
            <label className="text-xs text-gray-500 uppercase font-bold">Fecha del entrenamiento</label>
            <input type="date" value={physDate} onChange={e => setPhysDate(e.target.value)} className="w-full bg-gray-800 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
            <label className="text-xs text-gray-500 uppercase font-bold">Agregar Ejercicio</label>
            <div className="flex gap-2">
              <select value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)} className="flex-1 bg-gray-800 p-3 rounded-lg text-sm">
                {availableMetrics.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
              <input type="number" placeholder="Valor" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-24 bg-gray-800 p-3 rounded-lg text-center font-bold" />
              <button onClick={addPhysLine} className="bg-orange-600 px-4 rounded-lg font-bold">+</button>
            </div>
          </div>

          {physRecords.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-400 uppercase text-[10px]">
                  <tr><th className="p-3 text-left">Ejercicio</th><th className="p-3 text-center">Valor</th><th className="p-3"></th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {physRecords.map((r, i) => (
                    <tr key={i}>
                      <td className="p-3">{r.metric}</td>
                      <td className="p-3 text-center font-bold text-orange-400">{r.value}</td>
                      <td className="p-3 text-right"><button onClick={() => removePhysLine(i)} className="text-red-500 font-bold">X</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setMode('menu')} className="flex-1 bg-gray-800 p-4 rounded-xl font-bold">CANCELAR</button>
            <button onClick={savePhysical} disabled={physRecords.length === 0 || isSaving} className="flex-2 bg-orange-600 p-4 rounded-xl font-bold px-10 disabled:opacity-50">
              {isSaving ? 'GUARDANDO...' : 'GUARDAR TODO'}
            </button>
          </div>
        </div>
      )}

      {mode === 'match' && (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
          <input type="date" value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[10px] text-gray-500 uppercase font-bold">Min</label><input type="number" value={matchData.minutes} onChange={e => setMatchData({...matchData, minutes: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-center font-bold" /></div>
            <div><label className="text-[10px] text-gray-500 uppercase font-bold">Tackles</label><input type="number" value={matchData.tackles} onChange={e => setMatchData({...matchData, tackles: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-center font-bold" /></div>
            <div><label className="text-[10px] text-gray-500 uppercase font-bold">Tries</label><input type="number" value={matchData.tries} onChange={e => setMatchData({...matchData, tries: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg text-center font-bold" /></div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold">Sensación (1-10)</label>
            <input type="range" min="1" max="10" value={matchData.sensation} onChange={e => setMatchData({...matchData, sensation: e.target.value})} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2" />
            <div className="text-center font-bold text-blue-400 mt-1">{matchData.sensation}</div>
          </div>
          <textarea placeholder="Notas, lesiones o golpes..." value={matchData.notes} onChange={e => setMatchData({...matchData, notes: e.target.value})} className="w-full bg-gray-800 p-3 rounded-lg h-24 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          
          <div className="flex gap-2">
            <button onClick={() => setMode('menu')} className="flex-1 bg-gray-800 p-4 rounded-xl font-bold">CANCELAR</button>
            <button onClick={saveMatch} disabled={isSaving} className="flex-2 bg-blue-600 p-4 rounded-xl font-bold px-10">
              {isSaving ? 'GUARDANDO...' : 'GUARDAR PARTIDO'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}