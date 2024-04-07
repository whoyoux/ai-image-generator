import { PLANS } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import prisma from "./db";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseUrl() {
	return process.env.NODE_ENV === "production"
		? "https://ai.whx.world"
		: "http://localhost:3000";
}

export function getCreditsFromPlan(plan: PLANS) {
	switch (plan) {
		case PLANS.BASIC:
			return 10;
		case PLANS.MEDIUM:
			return 30;
		case PLANS.PRO:
			return 70;
		default:
			return 0;
	}
}

export async function getUser(userId: string) {
	return await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});
}
