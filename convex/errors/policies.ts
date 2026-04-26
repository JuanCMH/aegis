export const policyErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "La póliza no existe",
  templateNotFound:
    "La plantilla de pólizas no existe para este espacio de trabajo",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied: "No tienes permisos para gestionar pólizas en este espacio",
  policyNumberRequired: "El número de póliza es obligatorio",
  statusRequired: "El estado de la póliza es obligatorio",
  startDateRequired: "La fecha de inicio es obligatoria",
  endDateRequired: "La fecha de fin es obligatoria",
  invalidDateRange: "La fecha de fin debe ser posterior a la fecha de inicio",
  templateAlreadyExists:
    "Ya existe una plantilla de pólizas para este espacio de trabajo",
  invalidFieldData:
    "Los datos proporcionados no coinciden con la plantilla activa",
  fixedFieldsMissing:
    "Los campos fijos (Número, Estado, Fecha de inicio y Fecha de fin) son obligatorios",
  clientNotFound: "El cliente referenciado no existe",
  cannotCancelExpired: "No se puede cancelar una póliza ya vencida",
  cannotRenewCanceled: "No se puede renovar una póliza cancelada",
} as const;
