export const lineOfBusinessErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "El ramo no existe",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied: "No tienes permisos para gestionar ramos en este espacio",
  nameRequired: "El nombre del ramo es obligatorio",
  duplicateName: "Ya existe un ramo con ese nombre",
  duplicateCode: "Ya existe un ramo con ese código",
  invalidCommission: "La comisión debe estar entre 0 y 100",
} as const;
