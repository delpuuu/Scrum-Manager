'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentConfig } from "@/lib/tenantConfig";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Limpiamos errores previos

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirección exitosa, no hace falta quitar el loading porque desmonta la página
        router.push('/admin/dashboard');
      } else {
        // Acá estaba el bug: Liberamos el estado y mostramos el error
        setError(data.error || 'Credenciales inválidas');
        setIsLoading(false); 
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic drop-shadow-sm" style={{ color: "var(--color-secondary)" }}>
            {currentConfig.tenantName}
          </h1>
          <div className="mt-3 inline-block bg-[var(--color-primary)] text-[var(--color-secondary)] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.3em] shadow-sm">
            Acceso Restringido
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-fade-in">
              <p className="text-[10px] text-red-700 font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-2 ml-1">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading}
                className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-gray-800 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-50"
                placeholder="admin@torque.com"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-2 ml-1">
                Contraseña
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading}
                className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-gray-800 outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-[var(--color-secondary)] text-white font-black text-xs py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Verificando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <footer className="mt-12 text-center text-[8px] font-bold text-gray-400 uppercase tracking-[0.4em]">
          {currentConfig.poweredByLabel}
        </footer>
      </div>
    </div>
  );
}