'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

type MatchStat = { id: string; date: string; tackles: number; tries: number; minutes: number; conversions: number; yellowCards: number; redCards: number; sensation: number | null; notes: string | null };
type PhysicalRecord = { id: string; metric: string; value: number; date: string };
type Player = {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  division: string | null;
  matchStats: MatchStat[];
  physicalRecords: PhysicalRecord[];
};

const PHYSICAL_METRICS = [
  "Sentadilla (1RM - kg)", "Pecho Plano (1RM - kg)", "Despegue (1RM - kg)", 
  "Mejor Salto (CMJ/SJ - cm)", "Peso Corporal (kg)", "Test de Resistencia (Yo-Yo/Beep)", "Otra"
];

const getUnitForMetric = (metricName: string) => {
  if (metricName.includes('kg')) return 'kg';
  if (metricName.includes('cm')) return 'cm';
  return 'unidades';
};

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados Partidos
  const [showStatForm, setShowStatForm] = useState(false);
  const [statDate, setStatDate] = useState('');
  const [minutes, setMinutes] = useState('');
  const [tackles, setTackles] = useState('');
  const [tries, setTries] = useState('');
  const [conversions, setConversions] = useState('0');
  const [yellowCards, setYellowCards] = useState('0');
  const [redCards, setRedCards] = useState('0');
  const [sensation, setSensation] = useState('5');
  const [notes, setNotes] = useState('');
  const [expandedStatId, setExpandedStatId] = useState<string | null>(null);

  // Estados Físico
  const [showPhysicalForm, setShowPhysicalForm] = useState(false);
  const [metric, setMetric] = useState(PHYSICAL_METRICS[0]);
  const [value, setValue] = useState('');
  const [physDate, setPhysDate] = useState('');
  const [expandedPhysDate, setExpandedPhysDate] = useState<string | null>(null);

  const [selectedChartMetric, setSelectedChartMetric] = useState<string>('');

  const fetchPlayer = async () => {
    const res = await fetch(`/api/players/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setPlayer(data);
      if (data.physicalRecords.length > 0 && !selectedChartMetric) setSelectedChartMetric(data.physicalRecords[0].metric);
    } else {
      router.push('/admin/dashboard');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlayer(); }, [params.id]);

  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/players/${params.id}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: statDate, minutes, tackles, tries, conversions, yellowCards, redCards, sensation, notes }),
    });
    if (res.ok) {
      setStatDate(''); setMinutes(''); setTackles(''); setTries(''); setConversions('0'); setShowStatForm(false);
      fetchPlayer();
    }
  };

  const handleAddPhysical = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/players/${params.id}/physical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric, value, date: physDate }),
    });
    if (res.ok) {
      setValue(''); setPhysDate(''); setShowPhysicalForm(false);
      setSelectedChartMetric(metric); fetchPlayer();
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (confirm('¿Eliminar partido?')) await fetch(`/api/stats/${id}`, { method: 'DELETE' }).then(() => fetchPlayer());
  };

  const handleDeletePhysical = async (id: string) => {
    if (confirm('¿Eliminar registro?')) await fetch(`/api/physical/${id}`, { method: 'DELETE' }).then(() => fetchPlayer());
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-8 text-center font-medium">Cargando...</div>;
  if (!player) return null;

  // Lógica para agrupar registros físicos por fecha
  const groupedPhysical = player.physicalRecords.reduce((acc, record) => {
    const dateStr = new Date(record.date).toLocaleDateString('es-AR', { timeZone: 'UTC' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(record);
    return acc;
  }, {} as Record<string, PhysicalRecord[]>);

  const matchChartData = player.matchStats.map((stat) => ({
    fecha: new Date(stat.date).toLocaleDateString('es-AR', { timeZone: 'UTC', month: 'short', day: 'numeric' }),
    Tackles: stat.tackles, Tries: stat.tries, Conversiones: stat.conversions, Minutos: stat.minutes,
  })).reverse();

  const physicalChartData = player.physicalRecords.filter(r => r.metric === selectedChartMetric).map((r) => ({
    fecha: new Date(r.date).toLocaleDateString('es-AR', { timeZone: 'UTC', month: 'short', day: 'numeric' }),
    Valor: r.value
  })).reverse();

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{player.lastName}, {player.firstName}</h1>
            <div className="flex gap-2 mt-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">{player.division || 'Sin división'}</span>
              <span className="text-gray-600 font-medium text-xs py-1">{player.position || 'Sin posición'}</span>
            </div>
          </div>
          <Link href="/admin/dashboard" className="bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md hover:bg-gray-400">Volver</Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Panel Partidos (Acordeón por ID) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex justify-between items-center">
              Estadísticas de Partido
              <button onClick={() => setShowStatForm(!showStatForm)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{showStatForm ? 'Cerrar' : '+ Cargar'}</button>
            </h2>

            {showStatForm && (
              <form onSubmit={handleAddStat} className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
                <input type="date" required value={statDate} onChange={(e) => setStatDate(e.target.value)} className="w-full border rounded p-1 text-sm" />
                <div className="grid grid-cols-3 gap-2">
                   <input type="number" placeholder="Min" required value={minutes} onChange={(e) => setMinutes(e.target.value)} className="border rounded p-1 text-sm" />
                   <input type="number" placeholder="Tackles" required value={tackles} onChange={(e) => setTackles(e.target.value)} className="border rounded p-1 text-sm" />
                   <input type="number" placeholder="Tries" required value={tries} onChange={(e) => setTries(e.target.value)} className="border rounded p-1 text-sm" />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white text-sm py-1.5 rounded">Guardar Partido</button>
              </form>
            )}

            <ul className="divide-y divide-gray-200 h-64 overflow-y-auto pr-2">
              {player.matchStats.map((stat) => (
                <li key={stat.id} className="py-2">
                  <div className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded" onClick={() => setExpandedStatId(expandedStatId === stat.id ? null : stat.id)}>
                    <span className="font-semibold text-blue-700">{new Date(stat.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</span>
                    <span className="text-gray-400 text-xs">{expandedStatId === stat.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedStatId === stat.id && (
                    <div className="bg-gray-50 p-3 mt-1 rounded border border-gray-200 text-xs">
                      <p>Minutos: {stat.minutes} | Tackles: {stat.tackles} | Tries: {stat.tries}</p>
                      <button onClick={() => handleDeleteStat(stat.id)} className="text-red-500 mt-2 font-bold">Eliminar</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Panel Físico (Acordeón por Fecha - NUEVO) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex justify-between items-center">
              Evolución Física
              <button onClick={() => setShowPhysicalForm(!showPhysicalForm)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{showPhysicalForm ? 'Cerrar' : '+ Cargar'}</button>
            </h2>

            {showPhysicalForm && (
              <form onSubmit={handleAddPhysical} className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
                <select value={metric} onChange={(e) => setMetric(e.target.value)} className="w-full border rounded p-1 text-sm">{PHYSICAL_METRICS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder={`Valor (${getUnitForMetric(metric)})`} required value={value} onChange={(e) => setValue(e.target.value)} className="border rounded p-1 text-sm" />
                  <input type="date" required value={physDate} onChange={(e) => setPhysDate(e.target.value)} className="border rounded p-1 text-sm" />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white text-sm py-1.5 rounded">Guardar Medición</button>
              </form>
            )}

            <ul className="divide-y divide-gray-200 h-64 overflow-y-auto pr-2">
              {Object.keys(groupedPhysical).map((dateKey) => (
                <li key={dateKey} className="py-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded" 
                    onClick={() => setExpandedPhysDate(expandedPhysDate === dateKey ? null : dateKey)}
                  >
                    <span className="font-semibold text-orange-700">Mediciones: {dateKey}</span>
                    <span className="text-gray-400 text-xs">{expandedPhysDate === dateKey ? '▲' : '▼'}</span>
                  </div>
                  
                  {expandedPhysDate === dateKey && (
                    <div className="bg-orange-50 p-3 mt-1 rounded border border-orange-100 space-y-2">
                      {groupedPhysical[dateKey].map((record) => (
                        <div key={record.id} className="flex justify-between items-center text-xs border-b border-orange-200 pb-1 last:border-0">
                          <span><strong>{record.metric}:</strong> {record.value}</span>
                          <button onClick={() => handleDeletePhysical(record.id)} className="text-red-500 font-bold ml-2">X</button>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* Gráficos */}
        {(player.matchStats.length > 0 || player.physicalRecords.length > 0) && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Rendimiento Gráfico</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-72 flex flex-col">
                <h3 className="text-center text-sm font-bold text-gray-700 mb-4">Métricas Globales</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={matchChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="fecha" tick={{ fontSize: 10 }} /><YAxis yAxisId="left" tick={{ fontSize: 10 }} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#F97316" /><Tooltip /><Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar yAxisId="left" dataKey="Tackles" fill="#2563EB" radius={[4, 4, 0, 0]} /><Bar yAxisId="left" dataKey="Tries" fill="#10B981" radius={[4, 4, 0, 0]} /><Line yAxisId="right" type="monotone" dataKey="Minutos" stroke="#F97316" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700">Evolución Física</h3>
                  <select value={selectedChartMetric} onChange={(e) => setSelectedChartMetric(e.target.value)} className="text-xs border rounded p-1">
                    {Array.from(new Set(player.physicalRecords.map(r => r.metric))).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={physicalChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="fecha" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} /><Tooltip /><Line type="monotone" dataKey="Valor" stroke="#F59E0B" strokeWidth={3} />
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