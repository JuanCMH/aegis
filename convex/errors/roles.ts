export const roleErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "El rol no existe",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied: "No tienes permisos para gestionar roles en este espacio",
  cannotEditRoles: "No tienes permisos para editar roles",
  cannotDeleteRoles: "No tienes permisos para eliminar roles",
  cannotCreateRoles: "No tienes permisos para crear roles",
} as const;
