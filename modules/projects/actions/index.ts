"use server";

import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";
import { MessageRole, MessageType } from "@/src/generated/enums";
import { generateSlug } from "random-word-slugs";

type CreateProjectResult = { success: true; project: { id: string; name: string } } | { success: false; error: string };

export const createProject = async (value: string) => {
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" } as CreateProjectResult;
	}

	const newProject = await db.project.create({
		data: {
			name: generateSlug(2, { format: "kebab" }),
			userId: user.id,
			messages: {
				create: {
					content: value,
					role: MessageRole.USER,
					type: MessageType.RESULT,
				},
			},
		},
	});

	await inngest.send({
		name: "agent-code/run",
		data: {
			value,
			projectId: newProject.id,
		},
	});

	return {
		success: true,
		project: {
			id: newProject.id,
			name: newProject.name,
		},
	} as CreateProjectResult;
};

export const getProjects = async () => {
	const user = await getCurrentUser();
	if (!user) {
		return [];
	}
	const projects = await db.project.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
	});
	return projects;
};

export const getProjectById = async (id: string) => {
	const user = await getCurrentUser();
	if (!user) {
		return null;
	}
	const project = await db.project.findUnique({
		where: {
			id: id,
			userId: user.id,
		},
	});
	return project;
};
