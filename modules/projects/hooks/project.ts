import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, getProjectById, getProjects } from "../actions";

export const useGetProjects = () => {
	return useQuery({
		queryKey: ["projects"],
		queryFn: () => getProjects(),
	});
};

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (value: string) => {
			const result = await createProject(value);

			if (!result.success) {
				throw new Error(result.error);
			}

			return result.project;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
	});
};

export const useGetProjectById = (projectId: string) => {
	return useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProjectById(projectId),
	});
};
