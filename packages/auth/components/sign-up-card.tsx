"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { RiEyeLine, RiEyeOffLine, RiGoogleFill } from "@remixicon/react";
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
import { calculatePasswordStrength } from "../lib/password-strength";

export const SignUpCard = () => {
	const { signIn } = useAuthActions();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Las contraseñas no coinciden");
			return;
		}
		const strength = calculatePasswordStrength(password);
		if (!strength.isAcceptable) {
			toast.error(
				"Tu contraseña no es lo suficientemente segura. Debe tener al menos 8 caracteres y cumplir 3 de: mayúscula, minúscula, número y símbolo.",
			);
			return;
		}
		setPending(true);
		signIn("password", { name, email, password, flow: "signUp" })
			.catch(() =>
				toast.error(
					"Algo salió mal, recuerda que tu contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.",
				),
			)
			.finally(() => setPending(false));
	};

	const onProviderSignIn = (value: "google") => {
		setPending(true);
		signIn(value, { redirectTo: "/workspaces" }).finally(() =>
			setPending(false),
		);
	};

	return (
		<Card className="w-full h-full p-4">
			<CardHeader className="px-0 pt-0 space-y-1 text-center">
				<CardDescription>
					Crea tu cuenta y comienza a aprovechar los beneficios de nuestra
					plataforma.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 px-0 pb-0">
				<form className="space-y-2" onSubmit={onPasswordSignUp}>
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-muted-foreground"
						>
							Nombre
						</label>
						<Input
							required
							value={name}
							disabled={pending}
							placeholder="Juan Perez"
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
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
						<div className="relative">
							<Input
								required
								type={showPassword ? "text" : "password"}
								value={password}
								disabled={pending}
								autoComplete="new-password"
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
								aria-label={
									showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
								}
								title={
									showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
								}
								tabIndex={-1}
							>
								{showPassword ? (
									<RiEyeOffLine className="size-4" />
								) : (
									<RiEyeLine className="size-4" />
								)}
							</button>
						</div>
						{password && (
							<div className="mt-1.5 space-y-0.5" aria-live="polite">
								{(() => {
									const s = calculatePasswordStrength(password);
									return (
										<>
											<div className="h-2 w-full bg-muted rounded">
												<div
													className={`h-2 rounded ${s.colorClass}`}
													style={{ width: `${s.percent}%` }}
												/>
											</div>
											<div className="text-xs text-muted-foreground">
												{s.label}
											</div>
										</>
									);
								})()}
							</div>
						)}
					</div>
					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium text-muted-foreground"
						>
							Confirmar contraseña
						</label>
						<div className="relative">
							<Input
								required
								disabled={pending}
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								autoComplete="new-password"
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword((v) => !v)}
								className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
								aria-label={
									showConfirmPassword
										? "Ocultar confirmación"
										: "Mostrar confirmación"
								}
								title={
									showConfirmPassword
										? "Ocultar confirmación"
										: "Mostrar confirmación"
								}
								tabIndex={-1}
							>
								{showConfirmPassword ? (
									<RiEyeOffLine className="size-4" />
								) : (
									<RiEyeLine className="size-4" />
								)}
							</button>
						</div>
					</div>
					<Button type="submit" className="w-full" size="lg" disabled={pending}>
						Crear cuenta
					</Button>
				</form>
				<Separator />
				<div className="flex flex-col gap-y-2">
					<Button
						size="lg"
						disabled={pending}
						variant="outline"
						className="w-full relative pl-10"
						onClick={() => onProviderSignIn("google")}
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
