import Resend from "@auth/core/providers/resend";
import { ConvexError } from "convex/values";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { Resend as ResendAPI } from "resend";

const apiKey = process.env.AUTH_RESEND_KEY;

export const ResendOTPPasswordReset = Resend({
  apiKey,
  id: "resend-otp",
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 8;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Insurance <harmony@n3xus.cloud>",
      to: [email],
      subject: `Restablecimiento de contraseña`,
      html: `
        <p>¡Hola!</p>
          <p>
            Hemos recibido una solicitud para restablecer tu contraseña. Para
            continuar, introduce el siguiente código de verificación: <strong>${token}</strong>
          </p>
          <p>
            Si no has solicitado este cambio, ignora este mensaje y consulta con
            el administrador.
          </p>
          <p>
            Atentamente,
            <br />
            Team Insurance
        </p>
      `,
    });

    if (error) {
      throw new ConvexError("Could not send");
    }
  },
});
