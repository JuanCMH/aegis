import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";

export const useFetch = <T extends FunctionReference<"query">>(
	endpoint: T,
	args: T["_args"],
) => {
	const data: T["_returnType"] | undefined = useQuery(endpoint, args);
	const isLoading = data === undefined;

	return { data, isLoading };
};
