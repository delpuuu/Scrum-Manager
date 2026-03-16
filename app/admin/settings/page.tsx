'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [newMetric, setNewMetric] = useState('');

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = () => fetch('/api/metrics').then(res => res.json()).then(setMetrics);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetric) return;
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMetric }),
    });
    setNewMetric('');
    fetchMetrics();
  };

  const handleDeleteMetric = async (id: string) => {
    // Para simplificar, asumimos que la API de borrado existe o la crearemos luego
    alert('Función de borrado en desarrollo para el próximo sprint.');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Configuración</h1>
            <p className="text-slate-500 font-medium">Personalización de métricas de rendimiento</p>
          </div>
          <Link href="/admin/dashboard" className="text-xs font-bold bg-slate-200 px-4 py-2 rounded-xl uppercase">Volver</Link>
        </header>

        <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Ejercicios Disponibles</h2>
          
          <form onSubmit={handleAddMetric} className="flex gap-3 mb-8">
            <input 
              type="text" 
              placeholder="Ej: Salto Largo, Press Militar..." 
              value={newMetric} 
              onChange={e => setNewMetric(e.target.value)} 
              className="flex-1 bg-slate-50 border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <button className="bg-orange-500 text-white px-8 rounded-2xl font-black uppercase text-xs shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">Agregar</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(m => (
              <div key={m.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                <span className="text-sm font-bold text-slate-700 uppercase">{m.name}</span>
                <span className="text-[10px] font-black text-slate-300 group-hover:text-red-400 cursor-pointer transition-colors" onClick={() => handleDeleteMetric(m.id)}>ELIMINAR</span>
              </div>
            ))}
            {metrics.length === 0 && <p className="text-slate-400 italic text-sm col-span-2 text-center py-10">No has configurado ejercicios todavía.</p>}
          </div>
        </section>

        <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-100">
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            <strong>Nota:</strong> Los ejercicios que agregues aquí aparecerán instantáneamente en el link de carga que tienen los jugadores en sus celulares.
          </p>
        </div>

      </div>
    </div>
  );
}