"use server";

import { MessageRole, MessageType } from "@/src/generated/enums";
import db from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";
import { inngest } from "@/inngest/client";

export const createMessage = async (projectId: string, value: string) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	const project = await db.project.findUnique({
		where: {
			id: projectId,
			userId: user.id,
		},
	});

	if (!project) {
		throw new Error("Project not found");
    }
    
    const newMessage = await db.message.create({
        data: {
            projectId: projectId,
            content: value,
            role: MessageRole.USER,
            type: MessageType.RESULT,
        }
    })

    await inngest.send({
        name: "agent-code/run",
        data: {
            value: value,
            projectId: projectId,
        }
    })
    return newMessage;
};

export const getMessages = async (projectId: string) => { 
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }
    
    const project = await db.project.findUnique({
        where: {
            id: projectId,
            userId: user.id,
        }
    })
    if (!project) {
        throw new Error("Project not found");
    }

    const messages = await db.message.findMany({
        where: {
            projectId: projectId,
        },
        orderBy:{
            updatedAt: "asc"
        },
        include: {
            fragment: true,
        }
    })
    return messages;
}