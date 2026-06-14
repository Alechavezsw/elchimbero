'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Check } from 'lucide-react';

function LoginContent() {
  const { user, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirigir inmediatamente si ya está logueado
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName || !phone) {
          throw new Error('Por favor completa tu nombre y número de teléfono.');
        }
        await signUp(email, password, fullName, phone);
      } else {
        await signIn(email, password);
      }
      router.push(redirectPath);
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError(err.message || 'Credenciales incorrectas. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        
        {/* PESTAÑAS */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
          <button 
            onClick={() => { setIsSignUp(false); setError(null); }}
            style={{ 
              flex: 1, 
              paddingBottom: '1rem', 
              background: 'none', 
              border: 'none', 
              color: !isSignUp ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: !isSignUp ? '2px solid var(--primary)' : 'none',
              transition: 'var(--transition-smooth)'
            }}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => { setIsSignUp(true); setError(null); }}
            style={{ 
              flex: 1, 
              paddingBottom: '1rem', 
              background: 'none', 
              border: 'none', 
              color: isSignUp ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              borderBottom: isSignUp ? '2px solid var(--primary)' : 'none',
              transition: 'var(--transition-smooth)'
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* MENSAJE DE DEMO */}
        <div className="badge badge-warning" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', marginBottom: '1.5rem', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.8rem' }}>
          💡 Modo Demo: Podés registrarte o usar el usuario de prueba <strong>test@elchimbero.com</strong> con clave <strong>chimbero123</strong>.
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--color-closed)', 
            borderRadius: '8px', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            marginBottom: '1.5rem', 
            fontSize: '0.85rem' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {isSignUp && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre Completo</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Juan Pérez"
                    style={{ paddingLeft: '2.5rem' }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Teléfono / Celular</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 2645123456"
                    style={{ paddingLeft: '2.5rem' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', gap: '0.5rem' }}
            disabled={loading}
          >
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Ingresar'}
          </button>

        </form>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cargando Login...</h2>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
