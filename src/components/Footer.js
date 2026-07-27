import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.grid} container`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logoText}>
            <img
              src="/logo-el-chimbero.png?v=2"
              alt="El Chimbero"
              className={styles.logoImage}
              width={200}
              height={37}
            />
          </Link>
          <p className={styles.tagline}>
            La guía comercial, mercado y servicios de referencia para todos los chimberos. 
            Conectando comercios, vecinos y emprendedores del departamento de Chimbas, San Juan.
          </p>
        </div>

        <div>
          <h4 className={styles.title}>Navegación</h4>
          <ul className={styles.linksList}>
            <li className={styles.linkItem}><Link href="/guia">Guía Comercial</Link></li>
            <li className={styles.linkItem}><Link href="/clasificados">Clasificados</Link></li>
            <li className={styles.linkItem}><Link href="/mapa">Mapa de Chimbas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.title}>Servicios Útiles</h4>
          <ul className={styles.linksList}>
            <li className={styles.linkItem}><Link href="/farmacias">Farmacias de Turno</Link></li>
            <li className={styles.linkItem}><Link href="/kioscos">Kioscos 24 Horas</Link></li>
            <li className={styles.linkItem}><Link href="/login">Registrar mi Negocio</Link></li>
          </ul>
        </div>
      </div>

      <div className={`${styles.bottom} container`}>
        <p>© {currentYear} El Chimbero. Todos los derechos reservados.</p>
        <p>
          Hecho con <span className={styles.heart}>♥</span> para Chimbas, San Juan
        </p>
      </div>
    </footer>
  );
}
