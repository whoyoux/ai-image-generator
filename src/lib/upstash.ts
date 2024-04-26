import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

if (!process.env.UPSTASH_URL || !process.env.UPSTASH_TOKEN) {
	throw new Error("UPSTASH_URL and UPSTASH_TOKEN must be provided");
}

export const redis = new Redis({
	url: process.env.UPSTASH_URL,
	token: process.env.UPSTASH_TOKEN,
});

export const rateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, "30s"),
});

type RateLimitResponse =
	| {
			success: false;
			remaining: number;
			limit: number;
			message: string;
	  }
	| {
			success: true;
			remaining: number;
			limit: number;
	  };
export const checkRateLimit = async (): Promise<RateLimitResponse> => {
	const ip = headers().get("x-forwarded-for");
	if (!ip) {
		console.log("IP address not found");
		return {
			success: false,
			remaining: 0,
			limit: 0,
			message: "IP address not found",
		};
	}
	const { remaining, limit, success } = await rateLimit.limit(ip);
	if (!success) {
		return {
			success: false,
			remaining,
			limit,
			message: "Please slow down. Try again later.",
		};
	}

	return {
		success: true,
		remaining,
		limit,
	};
};
