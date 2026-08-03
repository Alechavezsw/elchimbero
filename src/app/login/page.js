'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Store } from 'lucide-react';
import { ROLES, ROLE_DESCRIPTIONS, canAccessAdmin } from '@/lib/roles';
import styles from './login.module.css';

function mapAuthError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('enotfound') ||
    msg.includes('authretryablefetcherror') ||
    err?.name === 'AuthRetryableFetchError'
  ) {
    return 'No se pudo conectar con el servidor de autenticación. Revisá tu conexión o la configuración de Supabase.';
  }
  if (msg.includes('cannot read properties of undefined')) {
    return 'Error de sesión. Recargá la página e intentá de nuevo.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Confirmá tu correo antes de ingresar. Revisá tu bandeja de entrada.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Ya existe una cuenta con ese correo. Probá iniciar sesión.';
  }
  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) {
    return 'El correo no es válido.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
  }
  return err?.message || 'No se pudo completar la operación. Intentá nuevamente.';
}

function LoginContent() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupRole, setSignupRole] = useState(ROLES.CLIENT);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const homeForUser = (u) => {
    if (searchParams.get('redirect')) return redirectPath;
    if (canAccessAdmin(u)) return '/admin';
    return '/dashboard';
  };

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(homeForUser(user));
    }
  }, [user, authLoading, router, redirectPath]);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim() || !phone.trim()) {
          throw new Error('Completá tu nombre y teléfono para crear la cuenta.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const result = await signUp(email.trim(), password, fullName.trim(), phone.trim(), signupRole);
        if (result?.needsEmailConfirmation) {
          setSuccess('Cuenta creada. Revisá tu email para confirmarla y después iniciá sesión.');
          setIsSignUp(false);
          setPassword('');
          return;
        }
        router.replace(homeForUser(result));
      } else {
        const logged = await signIn(email.trim(), password);
        router.replace(homeForUser(logged));
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.subtitle} style={{ margin: 0 }}>Cargando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Link href="/">
            <img
              src="/logo-el-chimbero.png?v=2"
              alt="El Chimbero"
              className={styles.logo}
              width={220}
              height={44}
            />
          </Link>
          <p className={styles.subtitle}>
            {isSignUp
              ? 'Creá tu cuenta para publicar comercios, clasificados y más.'
              : 'Ingresá para administrar tu perfil y tus publicaciones.'}
          </p>
        </div>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={`${styles.tab} ${!isSignUp ? styles.tabActive : ''}`}
            onClick={() => {
              setIsSignUp(false);
              resetMessages();
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={`${styles.tab} ${isSignUp ? styles.tabActive : ''}`}
            onClick={() => {
              setIsSignUp(true);
              resetMessages();
            }}
          >
            Crear cuenta
          </button>
        </div>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
        {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {isSignUp && (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fullName">Nombre completo</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    id="fullName"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Teléfono / celular</label>
                <div className={styles.inputWrap}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input
                    id="phone"
                    type="tel"
                    className={styles.input}
                    placeholder="Ej: 2645123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tipo de cuenta</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setSignupRole(ROLES.CLIENT)}
                    className={`${styles.tab} ${signupRole === ROLES.CLIENT ? styles.tabActive : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '0.85rem', height: 'auto', textAlign: 'left' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                      <User size={15} /> Cliente
                    </span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 500, lineHeight: 1.3 }}>
                      {ROLE_DESCRIPTIONS.client}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole(ROLES.BUSINESS)}
                    className={`${styles.tab} ${signupRole === ROLES.BUSINESS ? styles.tabActive : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '0.85rem', height: 'auto', textAlign: 'left' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                      <Store size={15} /> Negocio
                    </span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 500, lineHeight: 1.3 }}>
                      {ROLE_DESCRIPTIONS.business}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Correo electrónico</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? 'Procesando…' : isSignUp ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.switchHint}>
          {isSignUp ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}
          <button
            type="button"
            className={styles.switchBtn}
            onClick={() => {
              setIsSignUp(!isSignUp);
              resetMessages();
            }}
          >
            {isSignUp ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card}>
            <p className={styles.subtitle} style={{ margin: 0 }}>Cargando…</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
