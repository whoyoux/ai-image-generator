import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseUrl() {
	return process.env.NODE_ENV === "production"
		? "https://ai.whx.world"
		: "http://localhost:3000";
}
