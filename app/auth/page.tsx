import { Suspense } from "react";
import { AuthScreen } from "@/packages/auth/components/auth-screen";

const AuthPage = () => {
  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  );
};

export default AuthPage;
