import { Calendar, Pencil, User as UserIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fullDateTime } from "@/lib/date-formats";
import { useUpdateUserImage, useUpdateUserName } from "../../api";
import type { User } from "../../types";

export type ProfileModalProps = {
  open: boolean;
  user: User;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export function ProfileModal({ open, setOpen, user }: ProfileModalProps) {
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [userName, setUserName] = useState<string>(user.name || "");

  const {
    mutate: updateUserName,
    isPending: isUpdatingUserName,
    errorMessage: updateNameErrorMessage,
  } = useUpdateUserName();

  const {
    mutate: updateUserImage,
    isPending: isUpdatingUserImage,
    errorMessage: updateImageErrorMessage,
  } = useUpdateUserImage();

  const { mutate: generateUploadUrl, isPending: isGeneratingUploadUrl } =
    useGenerateUploadUrl();

  const avatarFallback = (user.name ?? "?").charAt(0).toUpperCase();

  const handleUpdateName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userName) {
      toast.error("No se ha ingresado ningún nombre");
      return;
    }
    updateUserName(
      { name: userName },
      {
        onSuccess() {
          toast.success("Nombre de usuario actualizado correctamente");
          setEditNameOpen(false);
        },
        onError() {
          toast.error(updateNameErrorMessage);
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
      { newImageId: storageId },
      {
        onSuccess() {
          toast.success("Imagen de usuario actualizada correctamente");
        },
        onError() {
          toast.error(updateImageErrorMessage);
        },
      },
    );
  };

  const isUploadingImage = isUpdatingUserImage || isGeneratingUploadUrl;

  return (
    <>
      <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-md">
        <AegisModalHeader
          icon={UserIcon}
          title="Perfil"
          description="Aquí puedes ver y editar tu información."
        />
        <AegisModalContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card p-4">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 break-all">
                <h4 className="truncate text-sm font-semibold tracking-tight">
                  {user.name}
                </h4>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="size-6 p-1"
                  onClick={() => setEditNameOpen(true)}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center pt-2">
                <Calendar className="mr-2 size-4 opacity-70" />
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
                if (e.target.files?.[0]) {
                  await handleUpdateImage(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              disabled={isUploadingImage}
              className="cursor-pointer shrink-0 disabled:opacity-60"
              onClick={() => {
                const input = document.getElementById("image-input");
                input?.click();
              }}
            >
              <Avatar className="size-16">
                <AvatarImage
                  src={user.userImage}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-aegis-sapphire/10 text-aegis-sapphire font-semibold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </AegisModalContent>
      </AegisModal>

      <AegisModal
        open={editNameOpen}
        onOpenChange={setEditNameOpen}
        maxWidth="sm:max-w-sm"
      >
        <AegisModalHeader
          icon={Pencil}
          title="Cambiar nombre"
          description="Actualiza el nombre que se muestra en tu perfil."
        />
        <AegisModalContent>
          <form
            id="update-name-form"
            className="space-y-1.5"
            onSubmit={handleUpdateName}
          >
            <Label
              htmlFor="user-name"
              className="text-xs font-medium text-aegis-steel"
            >
              Nombre
            </Label>
            <Input
              id="user-name"
              required
              minLength={4}
              maxLength={40}
              value={userName}
              disabled={isUpdatingUserName}
              placeholder="Nombre de usuario"
              onChange={(e) => setUserName(e.target.value)}
            />
          </form>
        </AegisModalContent>
        <AegisModalFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            form="update-name-form"
            type="submit"
            disabled={isUpdatingUserName}
          >
            Guardar
          </Button>
        </AegisModalFooter>
      </AegisModal>
    </>
  );
}
