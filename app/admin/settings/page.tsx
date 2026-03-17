'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { currentConfig } from '@/lib/tenantCOnfig';

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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER TORQUE LAB */}
        <header className="mb-10 flex items-center justify-between border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>
              Configuración
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Métricas de rendimiento</p>
          </div>
          <Link 
            href="/admin/dashboard" 
            className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all uppercase tracking-widest shadow-sm"
          >
            Volver
          </Link>
        </header>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Ejercicios Disponibles</h2>
          
          <form onSubmit={handleAddMetric} className="flex gap-3 mb-8">
            <input 
              type="text" 
              placeholder="Ej: Salto Largo, Press Militar..." 
              value={newMetric} 
              onChange={e => setNewMetric(e.target.value)} 
              className="flex-1 bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            <button className="bg-[var(--color-primary)] text-white px-8 rounded-2xl font-black uppercase text-xs shadow-lg shadow-gray-100 hover:opacity-90 transition-all">
              Agregar
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(m => (
              <div key={m.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-50 group hover:border-[var(--color-primary)] transition-colors">
                <span className="text-sm font-bold text-gray-700 uppercase">{m.name}</span>
                <span 
                    className="text-[10px] font-black text-gray-300 group-hover:text-red-400 cursor-pointer transition-colors uppercase tracking-widest" 
                    onClick={() => handleDeleteMetric(m.id)}
                >
                    ELIMINAR
                </span>
              </div>
            ))}
            {metrics.length === 0 && (
                <p className="text-gray-400 italic text-sm col-span-2 text-center py-10">No has configurado ejercicios todavía.</p>
            )}
          </div>
        </section>

        <div className="mt-10 p-6 bg-gray-100 rounded-3xl border border-gray-200">
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            <strong className="text-[var(--color-primary)] uppercase">Nota:</strong> Los ejercicios que agregues aquí aparecerán instantáneamente en el link de carga que tienen los jugadores en sus celulares.
          </p>
        </div>

      </div>
      <footer className="mt-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
        {currentConfig.poweredByLabel}
      </footer>
    </div>
  );
}