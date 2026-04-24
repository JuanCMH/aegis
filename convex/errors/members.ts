export const memberErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "El miembro no existe",
  companyNotFound: "La agencia no existe o no eres miembro",
  permissionDenied: "No tienes permisos para gestionar miembros",
  cannotRemoveOwner: "No puedes eliminar al propietario de la agencia",
  cannotRemoveSelf: "No puedes eliminarte a ti mismo. Usa la opción «Salir de la agencia»",
  cannotRemoveLastAdmin:
    "No puedes eliminar al último administrador de la agencia",
  cannotAssignRoleToOwner:
    "No puedes cambiar el rol del propietario de la agencia",
  cannotChangeOwnRole: "No puedes cambiar tu propio rol",
  ownerCannotLeave:
    "El propietario no puede salir de la agencia. Transfiere la propiedad o elimínala",
  onlyAdminCannotLeave:
    "Eres el único administrador. Asigna otro admin antes de salir",
  customRoleNotFound: "El rol personalizado no existe",
  customRoleMismatch: "El rol personalizado no pertenece a esta agencia",
} as const;
