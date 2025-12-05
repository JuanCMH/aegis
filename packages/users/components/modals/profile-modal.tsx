import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fullDateTime } from "@/lib/date-formats";
import { RiCalendarLine, RiPencilLine } from "@remixicon/react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { User } from "../../types";
import { useUpdateUserImage, useUpdateUserName } from "../../api";

export type ProfileModalProps = {
  open: boolean;
  user: User;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export function ProfileModal({ open, setOpen, user }: ProfileModalProps) {
  const [editNameOpen, setEditNameOpen] = useState(false);

  const [userName, setUserName] = useState<string>(user.name || "");

  const { mutate: updateUserName, isPending: isUpdatingUserName } =
    useUpdateUserName();

  const { mutate: updateUserImage, isPending: isUpdatingUserImage } =
    useUpdateUserImage();

  const { mutate: generateUploadUrl, isPending: isGeneratingUploadUrl } =
    useGenerateUploadUrl();

  const avatarFallback = user.name!.charAt(0).toUpperCase();

  const handleUpdateName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userName) {
      toast.error("No se ha ingresado ningún nombre");
      return;
    }
    updateUserName(
      {
        name: userName,
      },
      {
        onSuccess() {
          toast.success("Nombre de usuraio actualizado correctamente");
          setEditNameOpen(false);
        },
        onError() {
          toast.error("Error al actualizar el nombre de usuario");
        },
      },
    );
  };

  const handleUpdateImage = async (file: File | null) => {
    if (!file) {
      toast.error("No se ha seleccionado ninguna imagen");
      return;
    }
    const url = await generateUploadUrl({}, { throwError: true });
    if (!url) {
      toast.error("Error al generar la URL de la imagen");
      return;
    }

    const result = await fetch(url, {
      body: file,
      method: "POST",
      headers: { "Content-Type": file.type },
    });
    if (!result.ok) {
      toast.error("Error al subir la imagen");
      return;
    }

    const { storageId } = await result.json();

    updateUserImage(
      {
        newImageId: storageId,
      },
      {
        onSuccess() {
          toast.success("Imagen de usuario actualizada correctamente");
        },
        onError() {
          toast.error("Error al actualizar la imagen de usuario");
        },
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-md">
        <DialogHeader className="p-4">
          <DialogTitle>Perfil</DialogTitle>
          <DialogDescription>
            Aquí puedes ver y editar tu información.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <main className="flex flex-col gap-2 p-4">
          <div className="flex justify-between items-center space-x-4 bg-card p-4 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 break-all">
                <h4 className="text-sm font-semibold">{user.name}</h4>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="p-1"
                  onClick={() => setEditNameOpen(true)}
                >
                  <RiPencilLine className="size-4" />
                </Button>
              </div>
              <p className="text-sm">{user.email}</p>
              <div className="flex items-center pt-2">
                <RiCalendarLine className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs text-muted-foreground">
                  Te uniste el {fullDateTime(new Date(user._creationTime))}
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-input"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  await handleUpdateImage(e.target.files[0]);
                }
              }}
            />
            <button
              disabled={isUpdatingUserImage || isGeneratingUploadUrl}
              className="cursor-pointer"
              onClick={() => {
                const input = document.getElementById("image-input");
                if (input) input.click();
              }}
            >
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={user.userImage}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </button>
          </div>
          <div className="grid gap-2">
            <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar nombre</DialogTitle>
                </DialogHeader>
                <Separator />
                <form className="space-y-4" onSubmit={handleUpdateName}>
                  <Input
                    required
                    minLength={4}
                    maxLength={40}
                    value={userName}
                    disabled={isUpdatingUserName}
                    placeholder="Nombre de usuario"
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Guardar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
