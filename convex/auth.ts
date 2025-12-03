import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";
import { ResendOTPPasswordReset } from "./resend";

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      name: params.name as string,
      email: params.email as string,
    };
  },
  reset: ResendOTPPasswordReset,
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword, Google, Resend],
  session: {
    totalDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 días
    inactiveDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
  jwt: {
    durationMs: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
});
