'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { isMock } from '@/lib/db';
import styles from './Navbar.module.css';
import { 
  Menu, 
  X, 
  Store, 
  Tag, 
  HeartPulse, 
  Clock, 
  Map, 
  LayoutDashboard, 
  LogOut, 
  LogIn,
  CloudSun,
  Bus,
  Calendar,
  Briefcase,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

const COMMUNITY_PATHS = [
  '/farmacias',
  '/kioscos',
  '/colectivos',
  '/clima',
  '/eventos',
  '/servicios',
  '/empleo',
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  const isActive = (path) => pathname === path;
  const isCommunityActive = COMMUNITY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openDropdown = () => {
    clearCloseTimer();
    setDropdownOpen(true);
  };

  const scheduleCloseDropdown = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
      closeTimerRef.current = null;
    }, 160);
  };

  const closeDropdown = () => {
    clearCloseTimer();
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const onPointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        closeDropdown();
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeDropdown();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    closeDropdown();
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push('/');
  };

  const mobileNavItems = [
    { name: 'Guía Comercial', path: '/guia', icon: <Store size={18} /> },
    { name: 'Clasificados', path: '/clasificados', icon: <Tag size={18} /> },
    { name: 'Mapa Chimbas', path: '/mapa', icon: <Map size={18} /> },
    { name: 'Farmacias de Turno', path: '/farmacias', icon: <HeartPulse size={18} /> },
    { name: 'Kioscos Abiertos', path: '/kioscos', icon: <Clock size={18} /> },
    { name: 'Colectivos RedTulum', path: '/colectivos', icon: <Bus size={18} /> },
    { name: 'Clima y Alertas', path: '/clima', icon: <CloudSun size={18} /> },
    { name: 'Agenda de Eventos', path: '/eventos', icon: <Calendar size={18} /> },
    { name: 'Servicios Municipales', path: '/servicios', icon: <ShieldAlert size={18} /> },
    { name: 'Bolsa de Empleo', path: '/empleo', icon: <Briefcase size={18} /> },
  ];

  return (
    <header className={styles.header}>
      <div className={`${styles.navContainer} container`}>
        {/* LOGO */}
        <Link href="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
          <img
            src="/logo-el-chimbero.png?v=2"
            alt="El Chimbero"
            className={styles.logoImage}
            width={240}
            height={44}
          />
          {isMock && <span className={styles.demoBadge}>Demo</span>}
        </Link>

        {/* DESKTOP NAV */}
        <nav className={styles.menuDesktop}>
          <Link 
            href="/guia" 
            className={`${styles.navLink} ${isActive('/guia') ? styles.activeLink : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Store size={18} />
              Guía Comercial
            </span>
          </Link>
          
          <Link 
            href="/clasificados" 
            className={`${styles.navLink} ${isActive('/clasificados') ? styles.activeLink : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Tag size={18} />
              Clasificados
            </span>
          </Link>

          <Link 
            href="/mapa" 
            className={`${styles.navLink} ${isActive('/mapa') ? styles.activeLink : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Map size={18} />
              Mapa Chimbas
            </span>
          </Link>

          {/* SERVICIOS DROPDOWN */}
          <div
            ref={dropdownRef}
            className={styles.dropdownContainer}
            onMouseEnter={openDropdown}
            onMouseLeave={scheduleCloseDropdown}
          >
            <button
              type="button"
              className={`${styles.dropdownTrigger} ${dropdownOpen || isCommunityActive ? styles.dropdownActive : ''}`}
              onClick={() => (dropdownOpen ? closeDropdown() : openDropdown())}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-controls="comunidad-menu"
            >
              Comunidad y Servicios
              <ChevronDown size={14} className={dropdownOpen ? styles.chevronOpen : undefined} aria-hidden />
            </button>
            <div
              id="comunidad-menu"
              role="menu"
              className={`${styles.dropdownMenu} ${dropdownOpen ? styles.dropdownMenuOpen : ''}`}
            >
              <div className={styles.dropdownPanel}>
                <Link href="/farmacias" role="menuitem" className={`${styles.dropdownItem} ${isActive('/farmacias') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <HeartPulse size={16} style={{ color: 'var(--color-open)' }} /> Farmacias de Turno
                </Link>
                <Link href="/kioscos" role="menuitem" className={`${styles.dropdownItem} ${isActive('/kioscos') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <Clock size={16} style={{ color: 'var(--secondary)' }} /> Kioscos Abiertos
                </Link>
                <Link href="/colectivos" role="menuitem" className={`${styles.dropdownItem} ${isActive('/colectivos') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <Bus size={16} style={{ color: 'var(--primary)' }} /> Colectivos RedTulum
                </Link>
                <Link href="/clima" role="menuitem" className={`${styles.dropdownItem} ${isActive('/clima') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <CloudSun size={16} style={{ color: 'var(--secondary)' }} /> Clima y Alertas
                </Link>
                <Link href="/eventos" role="menuitem" className={`${styles.dropdownItem} ${isActive('/eventos') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <Calendar size={16} style={{ color: 'var(--accent-pink)' }} /> Agenda de Eventos
                </Link>
                <Link href="/servicios" role="menuitem" className={`${styles.dropdownItem} ${isActive('/servicios') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <ShieldAlert size={16} style={{ color: 'var(--color-warning)' }} /> Servicios Municipales
                </Link>
                <Link href="/empleo" role="menuitem" className={`${styles.dropdownItem} ${isActive('/empleo') ? styles.dropdownItemActive : ''}`} onClick={closeDropdown}>
                  <Briefcase size={16} style={{ color: '#a78bfa' }} /> Bolsa de Empleo
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.authContainer}>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LayoutDashboard size={18} />
                    Panel
                  </span>
                </Link>

                {(user.is_admin || user.email === 'admin@elchimbero.com') && (
                  <Link 
                    href="/admin" 
                    className={`${styles.navLink} ${isActive('/admin') ? styles.activeLink : ''}`}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-pink)' }}>
                      <LayoutDashboard size={18} />
                      Admin
                    </span>
                  </Link>
                )}
                
                <div className={styles.userBadge}>
                  <div className={styles.userAvatar} />
                  <span>{user.full_name || 'Mi Perfil'}</span>
                </div>

                <button onClick={handleSignOut} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LogIn size={16} />
                    Ingresar
                  </span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* MOBILE TOGGLE */}
        <button 
          className={styles.mobileToggle} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE NAV PANEL */}
      <div className={`${styles.menuMobile} ${mobileMenuOpen ? styles.menuMobileOpen : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {mobileNavItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navLink} ${isActive(item.path) ? styles.activeLink : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1rem', padding: '0.4rem 0' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {item.icon}
                {item.name}
              </span>
            </Link>
          ))}
        </div>
        
        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className={styles.userAvatar} style={{ width: '32px', height: '32px' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{user.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
            </div>
            
            <Link 
              href="/dashboard" 
              className="btn btn-secondary" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ justifyContent: 'flex-start' }}
            >
              <LayoutDashboard size={18} />
              Panel de Control
            </Link>

            {(user.is_admin || user.email === 'admin@elchimbero.com') && (
              <Link 
                href="/admin" 
                className="btn btn-secondary" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ justifyContent: 'flex-start', color: 'var(--accent-pink)', borderColor: 'rgba(236, 72, 153, 0.2)' }}
              >
                <LayoutDashboard size={18} />
                Administración
              </Link>
            )}
            
            <button 
              onClick={handleSignOut} 
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start', background: 'var(--color-closed)' }}
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            <Link 
              href="/login" 
              className="btn btn-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn size={18} />
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
