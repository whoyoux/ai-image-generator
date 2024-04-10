"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signIn } from "@/actions/auth.action";
import LoadingSpinner from "@/components/loading-spinner";
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
import { useState } from "react";
import { toast } from "sonner";

const SignInForm = () => {
	const [isPending, startAuth] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof SignInSchema>) {
		try {
			startAuth(true);
			const res = await signIn(values);
			if (res.success) {
				toast.success(res.message);
				router.push("/");
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
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
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
