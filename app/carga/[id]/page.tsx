'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { currentConfig } from "@/lib/tenantConfig";
import Link from 'next/link';

export default function PlayerEntryPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  
  const [selectedMetricId, setSelectedMetricId] = useState("");
  const [value, setValue] = useState('');
  const [reps, setReps] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/players/${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) router.push('/');
        setPlayer(data);
      });

    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        if (data.length > 0) setSelectedMetricId(data[0].id);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const metricObj = metrics.find(m => m.id === selectedMetricId);
    if (!metricObj) return;

    const res = await fetch(`/api/players/${params.id}/physical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric: metricObj.name, value: parseFloat(value), reps: parseInt(reps), date }),
    });

    if (res.ok) {
      setSuccess(true);
      setValue(''); setReps('1');
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  if (!player) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-[var(--color-primary)] font-black uppercase text-xs animate-pulse">Cargando Perfil...</p></div>;

  // Obtenemos el ejercicio seleccionado para saber su unidad dinámica
  const currentMetric = metrics.find(m => m.id === selectedMetricId);
  const metricLabel = currentMetric && currentMetric.unit ? `Valor (${currentMetric.unit})` : 'Valor / Marca';

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex flex-col items-center font-sans text-white">
      <div className="w-full max-w-md">
        
        <header className="text-center mb-8 border-b border-gray-800 pb-6 mt-4">
          <h1 className="text-4xl font-black uppercase italic drop-shadow-sm text-[var(--color-primary)]">
            Hola, {player.firstName}
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
            Panel de Carga Física
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-gray-700 mb-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-700 pb-2">Registro de Gimnasio</h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] uppercase font-black text-gray-400 block mb-2 ml-1">Ejercicio</label>
              <select value={selectedMetricId} onChange={(e) => setSelectedMetricId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl font-bold text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                {metrics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                {/* LA ETIQUETA DINÁMICA ESTÁ ACÁ */}
                <label className="text-[10px] uppercase font-black text-gray-400 block mb-2 ml-1">{metricLabel}</label>
                <input type="number" required value={value} onChange={e => setValue(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl font-bold text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center" placeholder="Ej: 100" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-black text-gray-400 block mb-2 ml-1">Repeticiones</label>
                <input type="number" required value={reps} onChange={e => setReps(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl font-bold text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-center" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-gray-400 block mb-2 ml-1">Fecha</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl font-bold text-gray-400 outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer" />
            </div>

            <button type="submit" disabled={loading} className={`w-full font-black text-xs py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-all ${success ? 'bg-green-500 text-white' : 'bg-[var(--color-primary)] text-gray-900 hover:opacity-90 disabled:opacity-50'}`}>
              {success ? '¡Guardado!' : loading ? 'Guardando...' : 'Guardar Serie'}
            </button>
          </div>
        </form>
        
        <footer className="mt-12 text-center text-[8px] font-bold text-gray-600 uppercase tracking-[0.4em] mb-8">
          {currentConfig.poweredByLabel}
        </footer>
      </div>
    </div>
  );
}