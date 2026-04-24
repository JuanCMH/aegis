export const quoteErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "La cotización no existe",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied:
    "No tienes permisos para gestionar cotizaciones en este espacio",
  invalidContractValue: "El valor del contrato debe ser mayor a 0",
  invalidContractDates:
    "La fecha de inicio del contrato debe ser anterior a la fecha de finalización",
  invalidBonds: "Debe incluir al menos un amparo en la cotización",
} as const;
