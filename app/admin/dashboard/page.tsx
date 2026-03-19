'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { currentConfig } from "@/lib/tenantConfig";

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  division: string | null;
  physicalRecords: { metric: string; value: number; reps: number }[];
};

const RUGBY_POSITIONS = ["Pilar", "Hooker", "Segunda Línea", "Tercera Línea", "Octavo", "Medio Scrum", "Apertura", "Centro", "Wing", "Fullback"];

export default function AdminDashboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [division, setDivision] = useState('');
  const [position, setPosition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedLeaderboardMetric, setSelectedLeaderboardMetric] = useState<string>('');
  const [metrics, setMetrics] = useState<string[]>([]);

  const fetchPlayers = async () => {
    const res = await fetch('/api/players');
    if (res.ok) {
      const data = await res.json();
      setPlayers(data);
      const allMetrics = new Set<string>();
      data.forEach((p: Player) => p.physicalRecords?.forEach(r => allMetrics.add(r.metric)));
      const metricsArray = Array.from(allMetrics);
      setMetrics(metricsArray);
      if (metricsArray.length > 0 && !selectedLeaderboardMetric) setSelectedLeaderboardMetric(metricsArray[0]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, division, position }),
    });
    if (res.ok) {
      setFirstName(''); setLastName(''); setDivision(''); setPosition('');
      fetchPlayers();
    }
    setIsSubmitting(false);
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar a este atleta?')) return;
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    fetchPlayers();
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/carga/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // PUNTO 1: Ranking por peso máximo directo sin calcular RM
  const getLeaderboard = () => {
    if (!selectedLeaderboardMetric) return [];
    const leaderboard = players.map(player => {
      const records = player.physicalRecords?.filter(r => r.metric === selectedLeaderboardMetric) || [];
      if (records.length === 0) return null;
      const maxRecord = Math.max(...records.map(r => r.value)); 
      return { id: player.id, name: `${player.lastName}, ${player.firstName}`, division: player.division, maxRecord };
    }).filter(Boolean) as { id: string; name: string; division: string | null; maxRecord: number }[];
    return leaderboard.sort((a, b) => b.maxRecord - a.maxRecord);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-[var(--color-primary)] font-bold uppercase text-xs animate-pulse">Sincronizando...</p></div>;

  const leaderboardData = getLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-t-2xl border-b-8 shadow-sm mb-8" style={{ borderColor: 'var(--color-primary)' }}>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{currentConfig.tenantName}</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Panel de Gestión de Plantel</p>
          </div>
          <Link href="/admin/settings" className="mt-4 md:mt-0 bg-[var(--color-primary)] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md">Configuración</Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">Nuevo Registro</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-gray-500 block mb-1">Nombre</label><input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[var(--color-primary)] bg-gray-50" /></div>
                <div><label className="text-[10px] font-bold text-gray-500 block mb-1">Apellido</label><input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[var(--color-primary)] bg-gray-50" /></div>
              </div>
              <div><label className="text-[10px] font-bold text-gray-500 block mb-1">División</label><input type="text" value={division} onChange={e => setDivision(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[var(--color-primary)] bg-gray-50" /></div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Posición</label>
                <select required value={position} onChange={e => setPosition(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-[var(--color-primary)] bg-gray-50 font-bold text-gray-700 cursor-pointer">
                  <option value="" disabled>Seleccionar puesto...</option>
                  {RUGBY_POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--color-primary)] text-white font-black text-xs py-3 rounded-lg uppercase tracking-widest mt-4 hover:opacity-90 disabled:opacity-50">Guardar Jugador</button>
            </form>
          </section>

          <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Lista del Plantel</h2>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Total: {players.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] text-gray-400 uppercase font-black tracking-widest border-b border-gray-100">
                  <tr><th className="pb-3 px-2">Atleta</th><th className="pb-3 px-2">División</th><th className="pb-3 px-2">Posición</th><th className="pb-3 px-2 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {players.length > 0 ? players.map(player => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="py-3 px-2 font-bold">{player.lastName}, {player.firstName}</td>
                      <td className="py-3 px-2 text-gray-500 text-xs">{player.division || '-'}</td>
                      <td className="py-3 px-2 text-[var(--color-primary)] font-bold text-xs">{player.position || '-'}</td>
                      <td className="py-3 px-2 text-right space-x-3">
                        <button onClick={() => copyLink(player.id)} className={`text-[10px] font-black uppercase tracking-widest ${copiedId === player.id ? 'text-green-500' : 'text-gray-400 hover:text-gray-800'}`}>{copiedId === player.id ? '¡COPIADO!' : 'Copiar Link'}</button>
                        <Link href={`/admin/players/${player.id}`} className="text-[10px] font-black text-[var(--color-primary)] hover:underline uppercase tracking-widest">Ver Perfil</Link>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={4} className="text-center py-10 text-xs text-gray-400 font-bold uppercase">Sin atletas</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-800 pb-4 gap-4">
            <h2 className="text-[12px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em] flex items-center gap-2">🏆 Ranking Max</h2>
            <select value={selectedLeaderboardMetric} onChange={e => setSelectedLeaderboardMetric(e.target.value)} className="bg-gray-800 border border-gray-700 text-white text-xs font-black uppercase px-4 py-2 rounded-lg outline-none cursor-pointer">
              {metrics.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            {leaderboardData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaderboardData.slice(0, 10).map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <span className={`text-2xl font-black w-8 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-500'}`}>{index + 1}</span>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-black uppercase text-white">{entry.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{entry.division || '-'}</p>
                    </div>
                    <span className="text-2xl font-black text-white">{entry.maxRecord}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[10px] text-gray-600 font-bold uppercase text-center py-6">Faltan datos</p>}
          </div>
        </section>

      </div>
    </div>
  );
}