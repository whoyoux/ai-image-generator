"use client";
import { createGoogleAuthorizationURL } from "@/actions/auth.action";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import GoogleIcon from "./google-icon";
import { Button } from "./ui/button";

const SignWithGoogle = () => {
	const router = useRouter();

	const SignInWithGoogle = async () => {
		console.log("Sign in with Google");
		const res = await createGoogleAuthorizationURL();

		if (res.success && res.data) {
			router.push(res.data.toString());
		} else {
			toast.error(
				String(res.message) ??
					"Some error occurred while signing in with Google. Please try again later.",
			);
		}
	};

	return (
		<Button
			className="w-full flex items-center gap-2"
			variant="outline"
			type="button"
			onClick={SignInWithGoogle}
		>
			<GoogleIcon />
			Google
		</Button>
	);
};

export default SignWithGoogle;
