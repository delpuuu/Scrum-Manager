'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      
      const data = await res.json().catch(() => null);

      if (res.ok) {
        // Éxito: Guardamos la sesión y entramos
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/admin/dashboard');
      } else {
        // Fallo: Mostramos el error del servidor
        setErrorMsg(data?.error || 'Credenciales inválidas o error de conexión.');
        setLoading(false);
      }
    } catch (error) {
      // Fallo crítico: El servidor no responde
      setErrorMsg('El servidor no responde. Revisá la terminal de VS Code.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4 font-sans">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            SCRUM MANAGER <span className="text-blue-600">PRO</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">
            Acceso Staff Técnico
          </p>
        </header>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 text-center uppercase tracking-wide">
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm" 
              required 
              disabled={loading} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm" 
              required 
              disabled={loading} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-white font-black transition-all uppercase tracking-widest disabled:opacity-50 mt-4 shadow-lg shadow-blue-200"
          >
            {loading ? 'VERIFICANDO...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>
  );
}