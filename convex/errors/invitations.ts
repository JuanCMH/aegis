export const invitationErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "La invitación no existe",
  permissionDenied: "No tienes permisos para gestionar invitaciones",
  alreadyExists:
    "Ya existe una invitación pendiente para este correo en esta agencia",
  alreadyMember: "Este usuario ya es miembro de la agencia",
  expired: "La invitación ha expirado. Solicita una nueva",
  alreadyAccepted: "Esta invitación ya fue aceptada",
  revoked: "Esta invitación fue revocada",
  emailMismatch:
    "Esta invitación fue enviada a otro correo. Inicia sesión con el correo correcto",
  invalidToken: "El enlace de invitación no es válido",
  customRoleMismatch: "El rol personalizado no pertenece a esta agencia",
  cannotInviteSelf: "No puedes invitarte a ti mismo",
} as const;
