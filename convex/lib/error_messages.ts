export const usersErrors = {
  unauthorized: "No tienes permisos para realizar esta acción",
  userNotFound: "Usuario no encontrado",
  insufficientPermissions: "No tienes los permisos necesarios para esta acción",
  createFailed: "Error al crear el usuario",
  deleteFailed: "Error al eliminar el usuario",
  updateFailed: "Error al actualizar el usuario",
  loadFailed: "Error al cargar los usuarios",
  userNotAuthenticated: "Usuario no autenticado",
  imageUpdateFailed: "Error al actualizar la imagen",
  nameUpdateFailed: "Error al actualizar el nombre",
};

export const workspacesErrors = {
  unauthorized: "No tienes permisos para realizar esta acción",
  workspaceNotFound: "Espacio de trabajo no encontrado",
  organizationNotFound: "Organización no encontrada",
  userNotFound: "Usuario no encontrado",
  joinError: "Código de unión incorrecto",
  workspaceLimitReached:
    "Alcanzaste el límite de espacios de trabajo de esta organización",
  cannotCreateNewCode: "No tienes permiso para crear un nuevo código",
  insufficientPermissions: "No tienes los permisos necesarios para esta acción",
  createFailed: "Error al crear el workspace",
  deleteFailed: "Error al eliminar el workspace",
  updateFailed: "Error al actualizar el workspace",
  loadFailed: "Error al cargar los espacios de trabajo",
  userNotAuthenticated: "Parece que no estás autenticado",
  memberNotFound: "Miembro no encontrado en el workspace",
  noWorkspaceAccess: "No tienes acceso a este workspace",
};

export const rolesErrors = {
  unauthorized: "No tienes permisos para realizar esta acción",
  roleNotFound: "Rol no encontrado",
  insufficientPermissions: "No tienes los permisos necesarios para esta acción",
  createFailed: "Error al crear el rol",
  deleteFailed: "Error al eliminar el rol",
  updateFailed: "Error al actualizar el rol",
  loadFailed: "Error al cargar los roles",
  userNotAuthenticated: "Parece que no estás autenticado",
  memberNotFound: "Miembro no encontrado en el workspace",
  noWorkspaceAccess: "No tienes acceso a este workspace",
  cannotEditRoles: "No tienes permiso para editar roles",
  cannotDeleteRoles: "No tienes permiso para eliminar roles",
  cannotCreateRoles: "No tienes permiso para crear roles",
};

export const logsErrors = {
  unauthorized: "No tienes permisos para realizar esta acción",
  logNotFound: "Log no encontrado",
  insufficientPermissions: "No tienes los permisos necesarios para esta acción",
  createFailed: "Error al crear el log",
  loadFailed: "Error al cargar los logs",
  userNotAuthenticated: "Usuario no autenticado",
  userNotFound: "Usuario no encontrado",
  memberNotFound: "Miembro no encontrado en el workspace",
  noWorkspaceAccess: "No tienes acceso a este workspace",
  noOrganizationAccess: "No tienes acceso a esta organización",
  customerNotFound: "Cliente no encontrado",
  organizationNotFound: "Organización no encontrada",
  workspaceNotFound: "Workspace no encontrado",
};
