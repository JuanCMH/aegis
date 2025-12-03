"use client";

import Link from "next/link";
import { useState } from "react";
import { CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SignInFlow } from "../types";
import { ResetCard } from "./reset-card";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");

  return (
    <div className="min-h-svh grid w-full grid-cols-1 md:grid-cols-2">
      <div className="flex relative flex-col items-center justify-center p-4 md:pb-24">
        <CardTitle className="text-5xl font-pacifico text-center pb-2 text-sky-500 mb-4">
          Insurance
        </CardTitle>
        <div className="w-full md:w-[420px]">
          <Tabs
            value={state}
            onValueChange={(val) => setState(val as SignInFlow)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="signIn">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signUp">Registro</TabsTrigger>
            </TabsList>

            <TabsContent value="signIn" className="min-h-[450px]">
              <SignInCard setState={setState} />
            </TabsContent>
            <TabsContent value="signUp" className="min-h-[450px]">
              <SignUpCard />
            </TabsContent>
            <TabsContent value="reset" className="min-h-[450px]">
              <ResetCard setState={setState} />
            </TabsContent>
          </Tabs>
          <p className="mt-8 px-2 text-center text-xs text-muted-foreground leading-relaxed md:hidden">
            Aunque puedes crear una cuenta, es necesario que un administrador te
            otorgue acceso. También puedes solicitar una prueba gratuita. Para
            más información, {""}
            <Link href="/contacto" className="underline underline-offset-2">
              contáctanos
            </Link>
            .
          </p>
        </div>
        <p className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-2 text-center text-xs text-muted-foreground leading-relaxed">
          Aunque puedes crear una cuenta, es necesario que un administrador te
          otorgue acceso. También puedes solicitar una prueba gratuita. Para más
          información, {""}
          <Link href="/contacto" className="underline underline-offset-2">
            contáctanos
          </Link>
          .
        </p>
      </div>

      <div className="relative hidden md:flex">
        <img
          src="/auth-image.jpg"
          alt="Auth illustration"
          className="h-full w-full object-cover object-right"
        />
      </div>
    </div>
  );
};
