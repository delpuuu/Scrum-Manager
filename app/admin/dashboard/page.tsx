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

export default function AdminDashboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeaderboardMetric, setSelectedLeaderboardMetric] = useState<string>('');
  const [metrics, setMetrics] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        
        // Extraer métricas únicas de todo el plantel para el selector del ranking
        const allMetrics = new Set<string>();
        data.forEach((p: Player) => {
          p.physicalRecords?.forEach(r => allMetrics.add(r.metric));
        });
        const metricsArray = Array.from(allMetrics);
        setMetrics(metricsArray);
        if (metricsArray.length > 0) setSelectedLeaderboardMetric(metricsArray[0]);
        
        setLoading(false);
      });
  }, []);

  const calc1RM = (peso: number, reps: number) => {
    if (reps <= 1) return peso;
    return Math.round(peso * (1 + reps / 30));
  };

  // Lógica core: Procesar todo el plantel y armar el Ranking
  const getLeaderboard = () => {
    if (!selectedLeaderboardMetric) return [];

    const leaderboard = players.map(player => {
      const records = player.physicalRecords?.filter(r => r.metric === selectedLeaderboardMetric) || [];
      if (records.length === 0) return null;

      const max1RM = Math.max(...records.map(r => calc1RM(r.value, r.reps)));
      return {
        id: player.id,
        name: `${player.lastName}, ${player.firstName}`,
        division: player.division,
        max1RM
      };
    }).filter(Boolean) as { id: string; name: string; division: string | null; max1RM: number }[];

    return leaderboard.sort((a, b) => b.max1RM - a.max1RM);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Base de Datos...</p>
    </div>
  );

  const leaderboardData = getLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>
              Centro de Comando
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
              {currentConfig.tenantName}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/config" className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-xs font-black text-gray-400 hover:text-[var(--color-primary)] transition-all uppercase tracking-widest shadow-sm">
              Configuración de Métricas
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: PLANTEL ACTIVO */}
          <section className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Plantel Activo</h2>
              <span className="text-[10px] bg-[var(--color-primary)] text-[var(--color-secondary)] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                {players.length} Atletas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {players.map(player => (
                <Link key={player.id} href={`/admin/players/${player.id}`} className="block bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-[var(--color-primary)] hover:shadow-md active:scale-95 transition-all group">
                  <h3 className="font-black text-gray-800 uppercase tracking-tighter group-hover:text-[var(--color-primary)] transition-colors text-sm">
                    {player.lastName}, {player.firstName}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                    {player.position || 'Sin pos.'} | {player.division || 'Sin div.'}
                  </p>
                </Link>
              ))}
              {players.length === 0 && (
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest col-span-2 text-center py-10">No hay jugadores registrados en el sistema.</p>
              )}
            </div>
          </section>

          {/* COLUMNA DERECHA: LEADERBOARD 1RM */}
          <section className="bg-[var(--color-secondary)] p-6 rounded-3xl shadow-xl border border-gray-800 text-white flex flex-col h-[585px]">
            <div className="mb-6 border-b border-gray-700 pb-5">
              <h2 className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                🏆 Ranking 1RM
              </h2>
              <select 
                value={selectedLeaderboardMetric} 
                onChange={e => setSelectedLeaderboardMetric(e.target.value)}
                className="w-full bg-gray-800 border-none text-white text-xs font-black uppercase p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer tracking-widest"
              >
                {metrics.length > 0 ? (
                  metrics.map(m => <option key={m} value={m}>{m}</option>)
                ) : (
                  <option>Sin datos físicos...</option>
                )}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {leaderboardData.length > 0 ? (
                <ul className="space-y-3">
                  {leaderboardData.map((entry, index) => (
                    <li key={entry.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-2xl border border-gray-700 hover:bg-gray-750 transition-colors">
                      <span className={`text-xl font-black w-6 text-center tracking-tighter ${index === 0 ? 'text-yellow-400 drop-shadow-md' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 truncate">
                        <p className="text-xs font-black uppercase truncate text-gray-100">{entry.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate mt-0.5">{entry.division || '-'}</p>
                      </div>
                      <span className="text-2xl font-black text-[var(--color-primary)] tracking-tighter">
                        {entry.max1RM}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mt-10">Faltan datos para armar el ranking.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}