import { toast } from "sonner";

export const handleConvexError = (error: any): string => {
  // Si el error tiene un campo 'data' (ConvexError)
  if (error?.data) {
    return error.data;
  }

  const errorMessage = error?.message || "Error desconocido";
  
  // Si es un error genérico de servidor en producción, mostrar mensaje amigable
  if (errorMessage.includes("Server Error") && errorMessage.includes("CONVEX")) {
    return "Error al procesar la solicitud. Por favor, intenta de nuevo.";
  }
  
  if (errorMessage.includes("Uncaught Error:")) {
    const parts = errorMessage.split("Uncaught Error:");
    if (parts.length > 1) {
      const afterUncaughtError = parts[1].trim();
      if (afterUncaughtError.includes(" at ")) {
        return afterUncaughtError.split(" at ")[0].trim();
      }
      return afterUncaughtError;
    }
  }
  
  if (errorMessage.includes("Error:")) {
    const parts = errorMessage.split("Error:");
    if (parts.length > 1) {
      const afterError = parts[1].trim();
      if (afterError.includes(" at ")) {
        return afterError.split(" at ")[0].trim();
      }
      return afterError;
    }
  }

  return errorMessage;
};

export const showConvexError = (error: any): void => {
  const cleanMessage = handleConvexError(error);
  console.log("Error original:", error?.message);
  console.log("Mensaje limpio:", cleanMessage);
  toast.error(cleanMessage);
};

export const handleConvexErrorCallback = (
  error: any,
  customCallback?: (error: any) => void,
): void => {
  showConvexError(error);
  customCallback?.(error);
};
