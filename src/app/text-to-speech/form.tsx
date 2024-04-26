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

import { generateSpeech } from "@/actions/speech.action";
import LoadingSpinner from "@/components/loading-spinner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import {
	MAXIMUM_SPEECH_SPEED,
	MINIMUM_SPEECH_SPEED,
	SpeechGeneratorPromptSchema,
	SpeechVoicesEnum,
} from "@/schemas";
import posthog from "posthog-js";

const TextToSpeechForm = () => {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<Awaited<
		ReturnType<typeof generateSpeech>
	> | null>(null);

	const form = useForm<z.infer<typeof SpeechGeneratorPromptSchema>>({
		resolver: zodResolver(SpeechGeneratorPromptSchema),
		defaultValues: {
			speed: 1,
		},
	});

	function onSubmit(data: z.infer<typeof SpeechGeneratorPromptSchema>) {
		setResult(null);

		startTransition(async () => {
			const resultSpeech = await generateSpeech(data);
			if (resultSpeech.success) {
				toast.success(resultSpeech.message);
				posthog.capture("speech_generated_successfully");
				setResult(resultSpeech);
				console.log(resultSpeech);
			} else {
				toast.error(resultSpeech.message);
				posthog.capture("speech_generated_error", {
					error: resultSpeech.message,
				});
			}
		});
	}
	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="text"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Text</FormLabel>
								<Textarea
									{...field}
									placeholder="A quick brown fox jumps over the lazy dog."
									rows={5}
								/>
								<FormDescription>
									Write the text you want to convert to speech.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="voice"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Voice</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a voice" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.keys(SpeechVoicesEnum.Values).map((voice) => (
											<SelectItem key={voice} value={voice}>
												{voice.charAt(0).toUpperCase() + voice.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									Select a voice for the speech.
								</FormDescription>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="speed"
						render={({ field: { value, onChange } }) => (
							<FormItem>
								<FormLabel>
									Voice Speed - {value * 100}% of normal speed
								</FormLabel>
								<FormControl>
									<Slider
										defaultValue={[value]}
										min={MINIMUM_SPEECH_SPEED}
										max={MAXIMUM_SPEECH_SPEED}
										step={0.25}
										onValueChange={(e) => onChange(e[0])}
									/>
								</FormControl>

								<FormDescription>
									Select the speed of the voice.
								</FormDescription>
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
							1 generation costs 2 credit
						</span>
					</div>
				</form>
			</Form>
			<div className="py-6 flex flex-col gap-4 items-center">
				{result?.success && (
					<>
						<h2 className="text-xl font-medium">Speech generated</h2>
						<p className="text-sm text-muted-foreground text-center">
							You can listen to the generated speech below.
							<br />
							Speech is saved to your dashboard. You can safely close this page.
						</p>

						{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
						<audio controls>
							<source src={result.speechUrl} type="audio/mp3" />
							Your browser does not support the audio element. See your new
							generated speech on your dashboard.
						</audio>
					</>
				)}
			</div>
		</div>
	);
};

export default TextToSpeechForm;
