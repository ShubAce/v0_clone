"use server";

import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const onBoardUser = async () => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				success: false,
				error: "No Authenticated User Found",
			};
		}

		return {
			success: true,
			user: session.user,
			message: "User onboarded successfully",
		};
	} catch (error) {
		console.error("Error onboarding user:", error);
		return {
			success: false,
			error: "Failed to onboard user",
		};
	}
};

export const getCurrentUser = async () => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return null;
		}

		const dbUser = await db.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
			},
		});

		return dbUser;
	} catch (error) {
		console.error("Error fetching current user:", error);
		return null;
	}
};
