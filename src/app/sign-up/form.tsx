"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signUp } from "@/actions/auth.action";
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
import { SignUpSchema } from "@/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SignUpForm = () => {
	const [isPending, startAuth] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof SignUpSchema>>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			username: "",
		},
	});

	async function onSubmit(values: z.infer<typeof SignUpSchema>) {
		try {
			startAuth(true);
			const res = await signUp(values);
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
				<h2 className="text-xl font-semibold">Sign up</h2>
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
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="jan.kowalski" {...field} />
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
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm password</FormLabel>
							<FormControl>
								<Input {...field} type="password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<p className="text-sm text-muted-foreground">
					By creating account you accept our{" "}
					<Link href="terms-of-service">
						<span className="text-primary">Terms of Service</span>
					</Link>
				</p>
				<Button
					type="submit"
					disabled={isPending}
					className="flex items-center gap-2"
				>
					{isPending && <LoadingSpinner />} Sign up
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

				<div className="flex items-center gap-2">
					<div className="flex items-center">You have an account?</div>
					<Link href="/sign-in">
						<Button variant="link">Sign in</Button>
					</Link>
				</div>
			</form>
		</Form>
	);
};

export default SignUpForm;
