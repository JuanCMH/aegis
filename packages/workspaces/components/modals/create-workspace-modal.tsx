import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/packages/auth/api";
import { RiLock2Line } from "@remixicon/react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateWorkspace,
  useGetOwnedWorkspaces,
  useJoinWorkspace,
} from "../../api";
import { useCreateWorkspaceModal } from "../../store/use-create-workspace-modal";
import { CustomColor } from "@/lib/custom-colors";
import { Id } from "@/convex/_generated/dataModel";

type WorkspaceData = {
  name: string;
  primaryColor: CustomColor;
  secondaryColor: CustomColor;
  logo?: Id<"_storage">;
};

export const CreateWorkspaceModal = () => {
  const router = useRouter();

  const [joinCode, setJoinCode] = useState("");
  const [open, setOpen] = useCreateWorkspaceModal();

  const [data, setData] = useState<any>({
    name: "",
    primaryColor: "blue",
    secondaryColor: "purple",
    logo: undefined,
  });

  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  const {
    mutate: joinMutate,
    isPending: isJoinPending,
    errorMessage: joinErrorMessage,
  } = useJoinWorkspace();
  const {
    mutate: createMutate,
    isPending: isCreating,
    errorMessage: createErrorMessage,
  } = useCreateWorkspace();

  const { data: ownedWorkspaces, isLoading: isLoadingWorkspaces } =
    useGetOwnedWorkspaces();

  const handleClose = () => {
    setData({
      name: "",
      primaryColor: "blue",
      secondaryColor: "purple",
      logo: undefined,
    });
    setJoinCode("");
    setOpen(false);
  };

  const maxWorkspaces = 2;

  const cantCreate = !!ownedWorkspaces && ownedWorkspaces >= maxWorkspaces;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (ownedWorkspaces === undefined) {
      return toast.error(
        "No se ha podido determinar el número de espacios que posee la organización",
      );
    }
    if (ownedWorkspaces >= maxWorkspaces) {
      return toast.error("La organización ha alcanzado el límite de espacios");
    }
    createMutate(
      {
        name: data.name,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logo: data.logo,
      },
      {
        onSuccess(workspaceId) {
          toast.success("Espacio creado correctamente");
          router.push(`workspaces/${workspaceId}`);
          handleClose();
        },
        onError: () => {
          toast.error(createErrorMessage);
        },
      },
    );
  };

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    joinMutate(
      { joinCode },
      {
        onSuccess(workspaceId) {
          toast.success("Te has unido correctamente al espacio");
          router.push(`workspaces/${workspaceId}`);
          handleClose();
        },
        onError: () => {
          toast.error(joinErrorMessage);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4">
          <DialogTitle>Crea o únete a un Espacio</DialogTitle>
          <DialogDescription>
            Un Espacio es un lugar donde puedes colaborar con otros usuarios.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <Tabs defaultValue="join" className="p-4">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="join">Unirse</TabsTrigger>
            <TabsTrigger disabled={cantCreate} value="create">
              Crear
              {cantCreate && <RiLock2Line className="size-4 ml-2" />}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <form className="grid grid-cols-2 gap-2" onSubmit={handleCreate}>
              <Input
                required
                value={data.name}
                minLength={4}
                maxLength={40}
                disabled={isCreating}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Nombre del espacio"
                className="col-span-2"
              />
              <div className="flex justify-end col-span-2">
                <Button type="submit" disabled={isCreating || isLoadingUser}>
                  Crear
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="join">
            <form
              className="flex flex-col items-center space-y-2"
              onSubmit={handleJoin}
            >
              <InputOTP
                required
                maxLength={6}
                value={joinCode}
                disabled={isJoinPending}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                onChange={(value) => setJoinCode(value)}
              >
                <InputOTPGroup className="text-rose-500 font-bold uppercase">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="text-rose-500 font-bold uppercase">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <div className="text-center text-sm">
                Ingresa el código del espacio al que deseas unirte.
              </div>
              <div className="flex justify-end w-full mt-2">
                <Button disabled={isJoinPending} type="submit">
                  Unirse
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
