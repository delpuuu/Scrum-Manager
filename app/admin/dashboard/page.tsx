'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { currentConfig } from '@/lib/tenantCOnfig';

export default function DashboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [division, setDivision] = useState('');
  const [position, setPosition] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    const res = await fetch('/api/players');
    if (res.ok) setPlayers(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/players/${editingId}` : '/api/players';
    const method = editingId ? 'PATCH' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, division, position }),
    });
    setFirstName(''); setLastName(''); setDivision(''); setPosition(''); setEditingId(null);
    fetchPlayers();
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setDivision(p.division || '');
    setPosition(p.position || '');
  };

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/carga/${id}`);
    alert('¡Link de carga copiado!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DINÁMICO TORQUE LAB */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>
              {currentConfig.tenantName}
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Panel de Gestión de Plantel</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/settings" className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all uppercase tracking-widest shadow-sm">
              ⚙️ Configuración
            </Link>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Atletas</p>
              <p className="text-2xl font-black text-[var(--color-primary)]">{players.length}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORMULARIO DE REGISTRO */}
          <div className="lg:col-span-4">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-10">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">
                {editingId ? 'Editar Atleta' : 'Nuevo Registro'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"/>
                  <input type="text" placeholder="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"/>
                </div>
                <input type="text" placeholder="División (ej: M19)" value={division} onChange={e => setDivision(e.target.value)} className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"/>
                <input type="text" placeholder="Posición" value={position} onChange={e => setPosition(e.target.value)} className="w-full bg-gray-50 border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"/>
                
                <button className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all uppercase text-xs tracking-widest shadow-lg shadow-gray-200">
                  {editingId ? 'Actualizar Ficha' : 'Guardar Jugador'}
                </button>
                
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setFirstName(''); setLastName(''); setPosition(''); setDivision('');}} className="w-full bg-gray-100 text-gray-500 py-2 rounded-xl text-xs font-bold uppercase mt-2">Cancelar</button>
                )}
              </form>
            </section>
          </div>

          {/* LISTADO DE JUGADORES */}
          <section className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-black text-gray-800 uppercase tracking-tight text-sm">Lista del Plantel</h2>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">{currentConfig.poweredByLabel}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-5">Atleta</th>
                    <th className="px-6 py-5">División</th>
                    <th className="px-6 py-5">Posición</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {players.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <Link href={`/admin/players/${p.id}`} className="block">
                          <p className="font-bold text-gray-700 uppercase text-sm group-hover:text-[var(--color-primary)] transition-colors">{p.lastName}, {p.firstName}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1 rounded-lg border border-gray-200 uppercase">{p.division || 'S/D'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-gray-400 uppercase">{p.position || '---'}</p>
                      </td>
                      <td className="px-6 py-5 text-right space-x-4">
                        <button onClick={() => handleCopyLink(p.id)} className="text-[10px] font-black text-gray-400 hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest border-b border-transparent hover:border-[var(--color-primary)]">Link</button>
                        <button onClick={() => handleEdit(p)} className="text-[10px] font-black text-gray-300 hover:text-gray-900 transition-colors uppercase tracking-widest">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}