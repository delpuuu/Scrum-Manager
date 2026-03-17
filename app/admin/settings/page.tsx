'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { currentConfig } from "@/lib/tenantConfig";

export default function SettingsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [newMetric, setNewMetric] = useState('');
  const [newUnit, setNewUnit] = useState('kg');

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = () => fetch('/api/metrics').then(res => res.json()).then(setMetrics);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetric || !newUnit) return;
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMetric, unit: newUnit }),
    });
    setNewMetric('');
    setNewUnit('kg');
    fetchMetrics();
  };

  const handleDeleteMetric = async (id: string) => {
    alert('Función de borrado en desarrollo.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex items-center justify-between border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>Configuración</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Gestión de Ejercicios</p>
          </div>
          <Link href="/admin/dashboard" className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all uppercase tracking-widest shadow-sm">Volver</Link>
        </header>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Métricas y Unidades</h2>
          
          <form onSubmit={handleAddMetric} className="flex flex-col md:flex-row gap-3 mb-8">
            <input type="text" placeholder="Ej: Sentadilla" value={newMetric} onChange={e => setNewMetric(e.target.value)} className="flex-2 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold" />
            <input type="text" placeholder="Unidad (kg, cm...)" value={newUnit} onChange={e => setNewUnit(e.target.value)} className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold text-center" />
            <button className="bg-[var(--color-primary)] text-[var(--color-secondary)] px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:opacity-90 transition-all">Agregar</button>
          </form>

          <div className="grid grid-cols-1 gap-3">
            {metrics.map(m => (
              <div key={m.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-50 group">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-700 uppercase">{m.name}</span>
                  <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded-lg uppercase tracking-widest">{m.unit}</span>
                </div>
                <span onClick={() => handleDeleteMetric(m.id)} className="text-[9px] font-black text-gray-300 group-hover:text-red-400 cursor-pointer transition-colors uppercase tracking-widest">ELIMINAR</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}