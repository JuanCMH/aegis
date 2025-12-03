"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { RiGoogleFill } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { SignInFlow } from "../types";

interface SignInCardProps {
	setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
	const { signIn } = useAuthActions();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);

	const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPending(true);
		signIn("password", { email, password, flow: "signIn" })
			.catch(() => toast.error("Correo o contraseña incorrectos"))
			.finally(() => setPending(false));
	};

	const onProviderSignIn = (value: "google") => {
		setPending(true);
		signIn(value, { redirectTo: "/organizations" }).finally(() =>
			setPending(false),
		);
	};

	return (
		<Card className="w-full h-full p-4">
			<CardHeader className="px-0 pt-0 space-y-1 text-center">
				<CardDescription>
					Puedes iniciar sesión con tu cuenta de correo o con tu cuenta de
					Google.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 px-0 pb-0">
				<form className="space-y-2" onSubmit={onPasswordSignIn}>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-muted-foreground"
						>
							Correo
						</label>
						<Input
							required
							type="email"
							value={email}
							disabled={pending}
							placeholder="ejemplo@mail.com"
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-muted-foreground"
						>
							Contraseña
						</label>
						<Input
							required
							type="password"
							value={password}
							disabled={pending}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<p
						onClick={() => setState("reset")}
						className="text-sm text-muted-foreground hover:underline cursor-pointer text-center"
					>
						¿Olvidaste tu contraseña?
					</p>
					<Button type="submit" className="w-full" size="lg" disabled={pending}>
						Iniciar sesión
					</Button>
				</form>
				<Separator />
				<div className="flex flex-col gap-y-2">
					<Button
						disabled={pending}
						onClick={() => onProviderSignIn("google")}
						variant="outline"
						size="lg"
						className="w-full relative pl-10"
					>
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
							<RiGoogleFill className="size-5" />
						</span>
						Continuar con Google
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
