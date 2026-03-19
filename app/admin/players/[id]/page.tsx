'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { currentConfig } from "@/lib/tenantConfig";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

type MatchStat = { id: string; date: string; tackles: number; tries: number; minutes: number; };
type PhysicalRecord = { id: string; metric: string; value: number; reps: number; date: string };
type Player = { id: string; firstName: string; lastName: string; position: string | null; division: string | null; matchStats: MatchStat[]; physicalRecords: PhysicalRecord[]; };

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showStatForm, setShowStatForm] = useState(false);
  const [statDate, setStatDate] = useState('');
  const [minutes, setMinutes] = useState('80');
  const [tackles, setTackles] = useState('0');
  const [tries, setTries] = useState('0');
  const [expandedStatId, setExpandedStatId] = useState<string | null>(null);

  const [showPhysicalForm, setShowPhysicalForm] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState("");
  const [value, setValue] = useState('');
  const [reps, setReps] = useState('1');
  const [physDate, setPhysDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedPhysDate, setExpandedPhysDate] = useState<string | null>(null);

  const [selectedChartMetric, setSelectedChartMetric] = useState<string>('');
  const [chartTimeFilter, setChartTimeFilter] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchPlayer = async () => {
    const res = await fetch(`/api/players/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setPlayer(data);
      if (data.physicalRecords.length > 0 && !selectedChartMetric) setSelectedChartMetric(data.physicalRecords[0].metric);
    } else router.push('/admin/dashboard');
    setLoading(false);
  };

  const fetchMetrics = async () => {
    const res = await fetch('/api/metrics');
    if (res.ok) {
      const data = await res.json();
      setAvailableMetrics(data);
      if (data.length > 0) setSelectedMetricId(data[0].id);
    }
  };

  useEffect(() => { fetchPlayer(); fetchMetrics(); }, [params.id]);

  const handleDeleteFullPlayer = async () => {
    if (!confirm('🚨 ATENCIÓN: ¿Estás seguro de que querés ELIMINAR a este atleta? Se borrará todo su historial físico y de partidos para siempre.')) return;
    const res = await fetch(`/api/players/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/dashboard');
    else alert("Hubo un error al intentar eliminar al jugador.");
  };

  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/players/${params.id}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: statDate, minutes, tackles, tries }),
    });
    if (res.ok) { setStatDate(''); setShowStatForm(false); fetchPlayer(); }
  };

  const handleAddPhysical = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMetricObj = availableMetrics.find(m => m.id === selectedMetricId);
    if (!currentMetricObj) return;
    const res = await fetch(`/api/players/${params.id}/physical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric: currentMetricObj.name, value: parseFloat(value), reps: parseInt(reps), date: physDate }),
    });
    if (res.ok) { setValue(''); setReps('1'); setShowPhysicalForm(false); setSelectedChartMetric(currentMetricObj.name); fetchPlayer(); }
  };

  const handleDeleteStat = async (id: string) => { if (confirm('¿Eliminar partido?')) await fetch(`/api/stats/${id}`, { method: 'DELETE' }).then(() => fetchPlayer()); };
  const handleDeletePhysical = async (id: string) => { if (confirm('¿Eliminar registro?')) await fetch(`/api/physical/${id}`, { method: 'DELETE' }).then(() => fetchPlayer()); };

  if (loading) return <div className="min-h-screen bg-gray-50 p-8 text-center font-bold text-gray-400 uppercase tracking-widest text-xs">Sincronizando Atleta...</div>;
  if (!player) return null;

  const groupedPhysical = player.physicalRecords.reduce((acc, record) => {
    const dateStr = new Date(record.date).toLocaleDateString('es-AR', { timeZone: 'UTC' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(record);
    return acc;
  }, {} as Record<string, PhysicalRecord[]>);

  const matchChartData = player.matchStats.map((stat) => ({
    fecha: new Date(stat.date).toLocaleDateString('es-AR', { timeZone: 'UTC', month: 'short', day: 'numeric' }),
    Tackles: stat.tackles, Tries: stat.tries, Minutos: stat.minutes,
  })).reverse();

  let filteredMetricRecords = player.physicalRecords.filter(r => r.metric === selectedChartMetric);
  const now = new Date();
  if (chartTimeFilter === 'week') filteredMetricRecords = filteredMetricRecords.filter(r => new Date(r.date) >= new Date(now.getTime() - 7 * 86400000));
  else if (chartTimeFilter === 'month') filteredMetricRecords = filteredMetricRecords.filter(r => new Date(r.date) >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
  else if (chartTimeFilter === 'year') filteredMetricRecords = filteredMetricRecords.filter(r => new Date(r.date) >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
  else if (chartTimeFilter === 'custom' && customStartDate && customEndDate) {
    const start = new Date(customStartDate), end = new Date(customEndDate); end.setHours(23, 59, 59, 999);
    filteredMetricRecords = filteredMetricRecords.filter(r => new Date(r.date) >= start && new Date(r.date) <= end);
  }

  const metricRecordsChronological = [...filteredMetricRecords].reverse();
  const dailyMax: Record<string, {peso: number, reps: number}> = {};
  
  metricRecordsChronological.forEach(r => {
    const dateStr = new Date(r.date).toLocaleDateString('es-AR', { timeZone: 'UTC', month: 'short', day: 'numeric' });
    if (!dailyMax[dateStr] || r.value > dailyMax[dateStr].peso) {
      dailyMax[dateStr] = { peso: r.value, reps: r.reps };
    }
  });

  const physicalChartData = Object.keys(dailyMax).map(date => ({
    fecha: date,
    'Peso Máximo': dailyMax[date].peso,
    reps: dailyMax[date].reps
  }));

  const CustomPhysicalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[var(--color-primary)] font-black">{data['Peso Máximo']} <span className="text-gray-500 text-xs">x {data.reps} reps</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">{player.lastName}, {player.firstName}</h1>
            <div className="flex gap-2 mt-1">
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{player.division || 'Sin división'}</span>
              <span className="bg-[var(--color-primary)] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">{player.position || 'Sin posición'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDeleteFullPlayer} className="bg-red-50 text-red-500 border border-red-100 px-6 py-2 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all uppercase shadow-sm">Eliminar Atleta</button>
            <Link href="/admin/dashboard" className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-[var(--color-primary)] transition-all uppercase shadow-sm">Volver</Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-2 flex justify-between items-center">
              Estadísticas de Partido
              <button onClick={() => setShowStatForm(!showStatForm)} className="text-[10px] bg-[var(--color-primary)] text-white px-3 py-1 rounded-full font-bold">{showStatForm ? 'Cerrar' : '+ Cargar'}</button>
            </h2>

            {showStatForm && (
              <form onSubmit={handleAddStat} className="mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Fecha del Partido</label>
                  <input type="date" required value={statDate} onChange={(e) => setStatDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1 text-center">Minutos</label>
                     <input type="number" required value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none text-center focus:border-[var(--color-primary)]" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1 text-center">Tackles</label>
                     <input type="number" required value={tackles} onChange={(e) => setTackles(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none text-center focus:border-[var(--color-primary)]" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1 text-center">Tries</label>
                     <input type="number" required value={tries} onChange={(e) => setTries(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none text-center focus:border-[var(--color-primary)]" />
                   </div>
                </div>
                
                <button type="submit" className="w-full bg-[var(--color-primary)] text-white font-black text-xs py-4 rounded-xl uppercase tracking-widest mt-2 hover:opacity-90 transition-opacity">
                  Guardar Partido
                </button>
              </form>
            )}

            <ul className="divide-y divide-gray-50 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {player.matchStats.map((stat) => (
                <li key={stat.id} className="py-2">
                  <div className="flex justify-between items-center cursor-pointer p-3 hover:bg-gray-50 rounded-xl" onClick={() => setExpandedStatId(expandedStatId === stat.id ? null : stat.id)}>
                    <span className="font-bold text-sm text-gray-700">{new Date(stat.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</span>
                    <span className="text-gray-300 text-[10px] font-black">{expandedStatId === stat.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedStatId === stat.id && (
                    <div className="bg-gray-50 p-4 mt-1 rounded-xl border border-gray-100 text-xs text-gray-500">
                      <p>Minutos: {stat.minutes} | Tackles: {stat.tackles} | Tries: {stat.tries}</p>
                      <button onClick={() => handleDeleteStat(stat.id)} className="text-red-400 mt-3 font-black uppercase tracking-widest hover:text-red-600 block">Eliminar Registro</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-2 flex justify-between items-center">
              Evolución Física
              <button onClick={() => setShowPhysicalForm(!showPhysicalForm)} className="text-[10px] bg-[var(--color-primary)] text-white px-3 py-1 rounded-full font-bold">{showPhysicalForm ? 'Cerrar' : '+ Cargar'}</button>
            </h2>

            {showPhysicalForm && (
              <form onSubmit={handleAddPhysical} className="mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Ejercicio</label>
                  <select value={selectedMetricId} onChange={(e) => setSelectedMetricId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-[var(--color-primary)]">
                    {availableMetrics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1 text-center">Valor / Peso</label>
                    <input type="number" required value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none text-center font-bold focus:border-[var(--color-primary)]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1 text-center">Repeticiones</label>
                    <input type="number" required value={reps} onChange={(e) => setReps(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none text-center font-bold focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Fecha</label>
                  <input type="date" required value={physDate} onChange={(e) => setPhysDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
                
                <button type="submit" className="w-full bg-[var(--color-primary)] text-white font-black text-xs py-4 rounded-xl uppercase tracking-widest mt-2 hover:opacity-90 transition-opacity">
                  Guardar Serie
                </button>
              </form>
            )}

            <ul className="divide-y divide-gray-50 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {Object.keys(groupedPhysical).map((dateKey) => (
                <li key={dateKey} className="py-2">
                  <div className="flex justify-between items-center cursor-pointer p-3 hover:bg-gray-50 rounded-xl" onClick={() => setExpandedPhysDate(expandedPhysDate === dateKey ? null : dateKey)}>
                    <span className="font-bold text-sm text-[var(--color-primary)]">{dateKey}</span>
                    <span className="text-gray-300 text-[10px] font-black">{expandedPhysDate === dateKey ? '▲' : '▼'}</span>
                  </div>
                  {expandedPhysDate === dateKey && (
                    <div className="bg-gray-50 p-4 mt-1 rounded-xl border border-gray-100 space-y-3">
                      {groupedPhysical[dateKey].map((record) => (
                        <div key={record.id} className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="flex-1"><strong className="text-gray-700">{record.metric}:</strong> {record.value} <span className="text-[9px] uppercase">x {record.reps} rep</span></span>
                          <button onClick={() => handleDeletePhysical(record.id)} className="text-red-300 hover:text-red-500 font-black ml-2">X</button>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {(player.matchStats.length > 0 || player.physicalRecords.length > 0) && (
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 border-b pb-2">RENDIMIENTO VISUAL</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-80 flex flex-col">
                <h3 className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Métricas Globales de Partido</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={matchChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                    <Bar yAxisId="left" dataKey="Tackles" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="Tries" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="Minutos" stroke="#1F2937" strokeWidth={3} dot={{ r: 4, fill: "#1F2937" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80 flex flex-col">
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em]">Peso Máximo Histórico</h3>
                    <div className="flex gap-2">
                      <select value={chartTimeFilter} onChange={(e) => setChartTimeFilter(e.target.value as any)} className="text-[10px] border-none bg-gray-50 font-bold uppercase p-2 rounded-lg outline-none cursor-pointer">
                        <option value="all">Histórico</option><option value="week">Última Semana</option><option value="month">Último Mes</option><option value="year">Último Año</option><option value="custom">Rango</option>
                      </select>
                      <select value={selectedChartMetric} onChange={(e) => setSelectedChartMetric(e.target.value)} className="text-[10px] border-none bg-gray-50 font-bold uppercase p-2 rounded-lg outline-none cursor-pointer">
                        {Array.from(new Set(player.physicalRecords.map(r => r.metric))).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={physicalChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomPhysicalTooltip />} />
                    <Line type="monotone" dataKey="Peso Máximo" stroke="var(--color-primary)" strokeWidth={4} dot={{ r: 6, fill: "var(--color-primary)" }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}