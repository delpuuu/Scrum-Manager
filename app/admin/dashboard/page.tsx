'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">SCRUM MANAGER <span className="text-blue-600">PRO</span></h1>
            <p className="text-slate-500 font-medium mt-1">Panel de Gestión de Plantel</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/settings" className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">
              ⚙️ Configuración
            </Link>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Atletas</p>
              <p className="text-2xl font-black text-blue-600">{players.length}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <section className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 sticky top-10">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">
                {editingId ? 'Editar Atleta' : 'Nuevo Registro'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                  <input type="text" placeholder="Apellido" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                </div>
                <input type="text" placeholder="División (ej: M19)" value={division} onChange={e => setDivision(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                <input type="text" placeholder="Posición" value={position} onChange={e => setPosition(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all uppercase text-xs tracking-widest">
                  {editingId ? 'Actualizar Ficha' : 'Guardar Jugador'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setFirstName(''); setLastName(''); setPosition(''); setDivision('');}} className="w-full bg-slate-100 text-slate-500 py-2 rounded-xl text-xs font-bold uppercase">Cancelar</button>
                )}
              </form>
            </section>
          </div>

          <section className="lg:col-span-8 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="font-black text-slate-800 uppercase tracking-tight">Lista del Plantel</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic font-serif">Rugby Management System</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-5">Atleta</th>
                    <th className="px-6 py-5">División</th>
                    <th className="px-6 py-5">Posición</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {players.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-5">
                        <Link href={`/admin/players/${p.id}`} className="block">
                          <p className="font-bold text-slate-700 uppercase text-sm group-hover:text-blue-600 transition-colors">{p.lastName}, {p.firstName}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-100 uppercase">{p.division || 'S/D'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-slate-400 uppercase">{p.position || '---'}</p>
                      </td>
                      <td className="px-6 py-5 text-right space-x-3">
                        <button onClick={() => handleCopyLink(p.id)} className="text-[10px] font-black text-green-600 hover:text-green-700 transition-colors uppercase tracking-widest">Link</button>
                        <button onClick={() => handleEdit(p)} className="text-[10px] font-black text-slate-300 hover:text-blue-600 transition-colors uppercase tracking-widest">Editar</button>
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