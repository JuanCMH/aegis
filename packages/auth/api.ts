import { useFetch } from "@/components/hooks/use-fetch";
import { api } from "@/convex/_generated/api";

export const useCurrentUser = () => useFetch(api.users.current, {});
