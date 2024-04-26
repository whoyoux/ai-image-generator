"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signIn } from "@/actions/auth.action";
import GoogleIcon from "@/components/google-icon";
import LoadingSpinner from "@/components/loading-spinner";
import SignWithGoogle from "@/components/sign-with-google";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignInSchema } from "@/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

const SignInForm = () => {
	const [isPending, startAuth] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof SignInSchema>) {
		try {
			startAuth(true);
			const res = await signIn(values);
			if (res.success) {
				toast.success(res.message);
				const ddd = posthog.capture("sign_in_success", { method: "email" });
				console.log(ddd);
				router.push("/");
				router.refresh();
			} else {
				toast.error(res.message);
			}
		} catch (err) {
			// alert(err);
			toast.error(String(err));
		} finally {
			startAuth(false);
		}
	}
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="max-w-md mx-auto flex flex-col gap-4 mt-10"
			>
				<h2 className="text-xl font-semibold">Sign in</h2>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="jan.kowalski@gmail.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					disabled={isPending}
					className="flex items-center gap-2"
				>
					{isPending && <LoadingSpinner />} Sign in
				</Button>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
				</div>
				<div>
					<SignWithGoogle />
				</div>
				<div className="flex items-center">
					You dont have an account?
					<Link href="/sign-up">
						<Button variant="link">Sign up</Button>
					</Link>
				</div>
			</form>
		</Form>
	);
};

export default SignInForm;
