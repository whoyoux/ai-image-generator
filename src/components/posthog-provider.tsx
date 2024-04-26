"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY)
	throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");

if (typeof window !== "undefined") {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		capture_pageview: false, // Disable automatic pageview capture, as we capture manually
	});
}

export function PHProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
