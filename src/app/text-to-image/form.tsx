"use client";

import { useState, useTransition } from "react";

import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { generateImage } from "@/actions/image.action";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ImageGeneratorPromptSchema, StyleEnum } from "@/schemas";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "../../components/loading-spinner";

const TextToImageForm = () => {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<Awaited<
		ReturnType<typeof generateImage>
	> | null>(null);

	const form = useForm<z.infer<typeof ImageGeneratorPromptSchema>>({
		resolver: zodResolver(ImageGeneratorPromptSchema),
	});

	function onSubmit(data: z.infer<typeof ImageGeneratorPromptSchema>) {
		setResult(null);

		startTransition(async () => {
			const resultImg = await generateImage(data);
			if (resultImg.success) {
				toast.success("Image generated successfully");
				setResult(resultImg);
				console.log(resultImg);
			} else {
				toast.error(resultImg.message);
			}
		});
	}

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="prompt"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Prompt</FormLabel>
								<Textarea
									{...field}
									placeholder="a cat with big moustache"
									rows={5}
								/>
								<FormDescription>
									Try to be as descriptive as possible.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="style"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Style</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a style" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.keys(StyleEnum.Values).map((style) => (
											<SelectItem key={style} value={style}>
												{style}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>Select a style for the image.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex flex-col items-start gap-1">
						<Button
							type="submit"
							disabled={isPending}
							size="lg"
							className="flex items-center gap-2"
						>
							{isPending && <LoadingSpinner />}
							Start generating
						</Button>
						<span className="text-sm text-muted-foreground">
							1 generation costs 1 credit
						</span>
					</div>
				</form>
			</Form>
			<div className="my-10">
				<div className="w-full aspect-square rounded-lg relative flex items-center justify-center border bg-card">
					{result?.success ? (
						<Image
							src={result.imgUrl}
							layout="fill"
							alt="Generated image"
							className="rounded-lg"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							quality={100}
						/>
					) : (
						<>
							{isPending ? (
								<div role="status">
									<svg
										aria-hidden="true"
										className="w-8 h-8 text-muted animate-spin fill-primary"
										viewBox="0 0 100 101"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
											fill="currentColor"
										/>
										<path
											d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
											fill="currentFill"
										/>
									</svg>
									<span className="sr-only">Loading...</span>
								</div>
							) : (
								<div className="text-center">Your image will show here</div>
							)}
						</>
					)}
				</div>
				<p className="mt-2 text-sm text-muted-foreground">
					All your images are saved on servers. You can see them on{" "}
					<Link href="/dashboard" className="underline underline-offset-4">
						your dashboard
					</Link>
					.
				</p>
			</div>
		</div>
	);
};

export default TextToImageForm;
