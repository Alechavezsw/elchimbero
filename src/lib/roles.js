/** Roles de usuario El Chimbero */
export const ROLES = {
  ADMIN: 'admin',
  BUSINESS: 'business',
  CLIENT: 'client',
};

export const ROLE_LABELS = {
  admin: 'Administración',
  business: 'Usuario de negocio',
  client: 'Usuario cliente',
};

export const ROLE_DESCRIPTIONS = {
  admin: 'Acceso total al panel de administración y a toda la plataforma.',
  business: 'Gestiona su comercio, delivery, clasificados y publicaciones propias.',
  client: 'Navega, pide delivery, publica clasificados y usa la app como vecino.',
};

export function normalizeRole(role, { isAdmin = false, email = '' } = {}) {
  if (isAdmin || email === 'admin@elchimbero.com' || role === ROLES.ADMIN) return ROLES.ADMIN;
  if (role === ROLES.BUSINESS) return ROLES.BUSINESS;
  if (role === ROLES.CLIENT) return ROLES.CLIENT;
  return ROLES.CLIENT;
}

export function withRoleFlags(user) {
  if (!user) return null;
  const role = normalizeRole(user.role, {
    isAdmin: !!user.is_admin,
    email: user.email || '',
  });
  return {
    ...user,
    role,
    is_admin: role === ROLES.ADMIN,
    is_business: role === ROLES.BUSINESS || role === ROLES.ADMIN,
    is_client: role === ROLES.CLIENT,
    role_label: ROLE_LABELS[role] || ROLE_LABELS.client,
  };
}

export function canAccessAdmin(user) {
  return !!user && normalizeRole(user.role, { isAdmin: user.is_admin, email: user.email }) === ROLES.ADMIN;
}

export function canManageBusiness(user) {
  if (!user) return false;
  const role = normalizeRole(user.role, { isAdmin: user.is_admin, email: user.email });
  return role === ROLES.ADMIN || role === ROLES.BUSINESS;
}
