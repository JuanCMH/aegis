import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";

const route = api.users;

export const useUpdateUserImage = () => useMutate(route.updateImage);

export const useUpdateUserName = () => useMutate(route.updateName);

export const useGetUserById = (data: typeof api.users.getById._args) =>
  useFetch(route.getById, data);
