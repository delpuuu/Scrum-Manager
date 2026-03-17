'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentConfig } from "@/lib/tenantConfig"; // CORREGIDO

export default function LoginPage() {
  const [email, setEmail] = useState('admin@scrum.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/admin/dashboard');
        router.refresh(); // Forzamos al middleware a re-evaluar
      } else {
        setErrorMsg(data.error || 'Credenciales inválidas');
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-gray-900">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
        
        <header className="mb-8 text-center border-b-4 pb-6" style={{ borderColor: "var(--color-primary)" }}>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic" style={{ color: "var(--color-secondary)" }}>
            {currentConfig.tenantName}
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Acceso Staff Técnico
          </p>
        </header>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-[10px] font-black mb-6 text-center uppercase tracking-widest">
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Institucional</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold text-sm" 
              required 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold text-sm" 
              required 
              disabled={loading} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[var(--color-primary)] hover:opacity-90 p-4 rounded-xl text-white font-black transition-all uppercase text-xs tracking-[0.2em] disabled:opacity-50 mt-4 shadow-lg shadow-gray-200"
          >
            {loading ? 'VERIFICANDO...' : 'Ingresar'}
          </button>
        </div>

        <footer className="mt-8 text-center">
           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{currentConfig.poweredByLabel}</p>
        </footer>
      </form>
    </div>
  );
}