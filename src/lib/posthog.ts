import { PostHog } from "posthog-node";

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
	throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
	host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});
