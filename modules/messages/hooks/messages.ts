import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { createMessage, getMessages } from "../actions";

export const prefetchMessages = async (projectId: string, queryClient: QueryClient) => {
	await queryClient.prefetchQuery({
		queryKey: ["messages", projectId],
		queryFn: () => getMessages(projectId),
		staleTime: 10000,
	});
};

export const useGetMessages = (projectId: string) => {
	return useQuery({
		queryKey: ["messages", projectId],
		queryFn: () => getMessages(projectId),
		staleTime: 10000,
		refetchInterval: (query) => {
			const messages = query.state.data;
			return messages && messages.length > 0 ? 5000 : false;
		},
	});
};

export const useCreateMessage = (projectId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (value: string) => createMessage(projectId, value),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", projectId] }),
	});
};
