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

export const membersErrors = {
  unauthorized: "No tienes permisos para realizar esta acción",
  memberNotFound: "Miembro no encontrado",
  insufficientPermissions: "No tienes los permisos necesarios para esta acción",
  createFailed: "Error al crear el miembro",
  deleteFailed: "Error al eliminar el miembro",
  updateFailed: "Error al actualizar el miembro",
  loadFailed: "Error al cargar los miembros",
  userNotAuthenticated: "Usuario no autenticado",
  noWorkspaceAccess: "No tienes acceso a este workspace",
  cannotRemoveLastAdmin: "No se puede eliminar el último administrador",
  cannotRemoveYourself: "No puedes eliminarte a ti mismo",
  userNotFound: "Usuario no encontrado",
};

export const chatErrors = {
  unauthorized: "No tienes permisos para realizar esta acción",
  userNotAuthenticated: "Usuario no autenticado",
  threadNotFound: "Conversación no encontrada",
  threadAccessDenied: "No tienes acceso a esta conversación",
  messageSendFailed: "Error al enviar el mensaje",
  threadCreateFailed: "Error al crear la conversación",
  loadFailed: "Error al cargar las conversaciones",
};
