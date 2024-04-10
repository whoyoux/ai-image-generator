"use server";

import { generateSpeechFromText } from "@/lib/ai";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/upstash";
import { SpeechGeneratorPromptSchema } from "@/schemas";
import { z } from "zod";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

type Response =
	| {
			success: true;
			speechUrl: string;
			message?: string;
	  }
	| {
			success: false;
			message: string;
	  };

const CREDIT_PER_SPEECH_GENERATE = 2;

export const generateSpeech = async (
	data: z.infer<typeof SpeechGeneratorPromptSchema>,
): Promise<Response> => {
	const parsed = SpeechGeneratorPromptSchema.safeParse(data);

	if (!parsed.success) {
		return {
			success: false,
			message: "Unauthorized",
		};
	}

	const isNotLimited = await checkRateLimit();
	if (!isNotLimited.success) {
		return {
			success: false,
			message: isNotLimited.message,
		};
	}

	const { user } = await validateRequest();

	if (!user) {
		return {
			success: false,
			message: "Unauntheticated user. Please sign in.",
		};
	}

	const res: Response = await prisma.$transaction(
		async (tx) => {
			const foundUser = await tx.user.findUnique({
				where: {
					id: user.id,
				},
			});

			if (!foundUser) {
				return {
					success: false,
					message: "User not found",
				};
			}

			if (foundUser.credits < CREDIT_PER_SPEECH_GENERATE) {
				return {
					success: false,
					message: "Not enough credits",
				};
			}

			const speech = await generateSpeechFromText(
				data.text,
				data.voice,
				data.speed,
			);

			if (!speech.ok) {
				return {
					success: false,
					message: `Failed to generate speech ${speech.statusText}`,
				};
			}

			const speechBlob = new Blob([await speech.arrayBuffer()]);

			const speechFile = new File(
				[speechBlob],
				`speech-${user.id}-${nanoid()}.mp3`,
			);

			const uploadedSpeech = await utapi.uploadFiles(speechFile, {
				metadata: {
					userId: user.id,
				},
			});

			if (uploadedSpeech.error) {
				console.error("Failed to upload speech file", uploadedSpeech.error);
				return {
					success: false,
					message: "Failed to upload speech file",
				};
			}

			await tx.user.update({
				where: {
					id: user.id,
				},
				data: {
					credits: {
						decrement: CREDIT_PER_SPEECH_GENERATE,
					},
					speeches: {
						create: {
							speechUrl: uploadedSpeech.data.url,
							voice: data.voice,
							text: data.text,
							speed: data.speed,
						},
					},
				},
			});

			return {
				success: true,
				message: "Speech generated successfully",
				speechUrl: uploadedSpeech.data.url,
			};
		},
		{
			timeout: 300000, // 5 minutes
		},
	);
	revalidatePath("/text-to-speech");
	return res;
};
