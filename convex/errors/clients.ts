export const clientErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "El cliente no existe",
  templateNotFound:
    "La plantilla de clientes no existe para este espacio de trabajo",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied:
    "No tienes permisos para gestionar clientes en este espacio",
  nameRequired: "El nombre del cliente es obligatorio",
  identificationRequired: "El número de identificación es obligatorio",
  templateAlreadyExists:
    "Ya existe una plantilla de clientes para este espacio de trabajo",
  invalidFieldData:
    "Los datos proporcionados no coinciden con la plantilla activa",
  fixedFieldsMissing:
    "Los campos fijos (Nombre y Número de Identificación) son obligatorios",
} as const;
