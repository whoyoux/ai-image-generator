"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signIn } from "@/actions/auth.action";
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
import { toast } from "sonner";

const SignInForm = () => {
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
			const res = await signIn(values);
			if (res.success) {
				toast.success("Sign in successful");
				router.push("/");
			}
		} catch (err) {
			// alert(err);
			toast.error(String(err));
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
				<Button type="submit">Sign in</Button>
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
