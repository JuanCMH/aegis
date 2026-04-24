"use client";

import { Building2, Lock } from "lucide-react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalHeader,
} from "@/components/aegis/aegis-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateCompany,
  useGetOwnedCompanies,
  useJoinCompany,
} from "../../api";
import { useCreateCompanyModal } from "../../store/use-create-company-modal";

const MAX_COMPANIES = 2;

export const CreateCompanyModal = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateCompanyModal();

  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const {
    mutate: joinMutate,
    isPending: isJoinPending,
    errorMessage: joinErrorMessage,
  } = useJoinCompany();
  const {
    mutate: createMutate,
    isPending: isCreating,
    errorMessage: createErrorMessage,
  } = useCreateCompany();

  const { data: ownedCompanies } = useGetOwnedCompanies();

  const cantCreate =
    typeof ownedCompanies === "number" && ownedCompanies >= MAX_COMPANIES;

  const handleClose = () => {
    setName("");
    setJoinCode("");
    setOpen(false);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ownedCompanies === undefined) {
      return toast.error(
        "No se pudo determinar el número de agencias que posees.",
      );
    }
    if (ownedCompanies >= MAX_COMPANIES) {
      return toast.error(
        "Has alcanzado el límite de agencias que puedes crear.",
      );
    }
    createMutate(
      {
        name,
        primaryColor: "blue",
        secondaryColor: "purple",
        logo: undefined,
      },
      {
        onSuccess(companyId) {
          toast.success("Agencia creada correctamente");
          router.push(`/companies/${companyId}`);
          handleClose();
        },
        onError: () => {
          toast.error(createErrorMessage);
        },
      },
    );
  };

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    joinMutate(
      { joinCode },
      {
        onSuccess(companyId) {
          toast.success("Te uniste correctamente a la agencia");
          router.push(`/companies/${companyId}`);
          handleClose();
        },
        onError: () => {
          toast.error(joinErrorMessage);
        },
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={handleClose}>
      <AegisModalHeader
        icon={Building2}
        title="Crear o unirse a una agencia"
        description="Cada agencia es un espacio aislado con sus propios clientes, pólizas y miembros."
      />
      <AegisModalContent>
        <Tabs defaultValue="join">
          <TabsList className="mb-5 grid w-full grid-cols-2">
            <TabsTrigger value="join">Unirse</TabsTrigger>
            <TabsTrigger disabled={cantCreate} value="create">
              Crear
              {cantCreate ? <Lock className="ml-2 size-3.5" /> : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="join" className="mt-0 space-y-4">
            <form
              className="flex flex-col items-center gap-4"
              onSubmit={handleJoin}
            >
              <InputOTP
                required
                maxLength={6}
                value={joinCode}
                disabled={isJoinPending}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                onChange={(value) => setJoinCode(value.toLowerCase())}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-center text-xs text-muted-foreground">
                Ingresa el código de invitación de tu agencia.
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={isJoinPending}
                className="w-full"
              >
                Unirse
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="create" className="mt-0 space-y-4">
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-1.5">
                <Label
                  htmlFor="company-name"
                  className="text-xs font-medium text-aegis-steel"
                >
                  Nombre de la agencia
                </Label>
                <Input
                  id="company-name"
                  required
                  minLength={4}
                  maxLength={40}
                  disabled={isCreating}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seguros del Valle"
                />
                <p className="text-xs text-muted-foreground">
                  Puedes crear hasta {MAX_COMPANIES} agencias con una cuenta.
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isCreating}
                className="w-full"
              >
                Crear agencia
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </AegisModalContent>
    </AegisModal>
  );
};
