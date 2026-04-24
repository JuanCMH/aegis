export const insurerErrors = {
  unauthorized: "No estás autorizado para realizar esta acción",
  notFound: "La aseguradora no existe",
  companyNotFound: "El espacio de trabajo no existe o no eres miembro",
  permissionDenied:
    "No tienes permisos para gestionar aseguradoras en este espacio",
  nameRequired: "El nombre de la aseguradora es obligatorio",
  duplicateName: "Ya existe una aseguradora con ese nombre",
} as const;
