export const bondErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "El amparo no existe",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied: "No tienes permisos para gestionar amparos en este espacio",
  nameRequired: "El nombre del amparo es requerido",
  duplicateName: "Ya existe un amparo con ese nombre",
  duplicateCode: "Ya existe un amparo con ese código",
  invalidRate: "La tasa debe estar entre 0 y 100",
} as const;
