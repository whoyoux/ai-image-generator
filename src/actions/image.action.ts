"use server";
import OpenAI from "openai";

import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/db";
import { PromptSchema } from "@/schemas";
import { z } from "zod";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";

const openai = new OpenAI();
const utapi = new UTApi();

type ImageGenerationResult =
	| {
			success: true;
			imgUrl: string;
	  }
	| {
			success: false;
			message: string;
	  };

export const generateImage = async (
	data: z.infer<typeof PromptSchema>,
): Promise<ImageGenerationResult> => {
	const parsed = PromptSchema.safeParse(data);

	try {
		if (!parsed.success) {
			return {
				success: false,
				message: "Unauthorized",
			} satisfies ImageGenerationResult;
		}

		const { user } = await validateRequest();

		if (!user) {
			return {
				success: false,
				message: "Unauthorized",
			} satisfies ImageGenerationResult;
		}

		const res = await prisma.$transaction(
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
					} satisfies ImageGenerationResult;
				}

				if (foundUser.credits < 1) {
					return {
						success: false,
						message: "Not enough credits",
					} satisfies ImageGenerationResult;
				}

				console.log("Started generating image.");

				const image = await openai.images.generate({
					model: "dall-e-3",
					prompt: `Create an image of ${parsed.data.prompt} in the style of ${parsed.data.style}. Do not add things that are not in the prompt.`,
					user: user.id,
					response_format: "b64_json",
				});

				console.log("Finished generating image.");

				if (!image.data[0].b64_json)
					return {
						success: false,
						message: "Failed to generate image",
					} satisfies ImageGenerationResult;

				const imgBuffer = Buffer.from(image.data[0].b64_json, "base64");

				console.log("Started compressing image.");

				const compressedImageBuffer = await sharp(imgBuffer)
					.withMetadata()
					.png({
						quality: 100,
					})
					.toBuffer();

				console.log("Finished compressing image.");

				console.log("Uploading image.");

				const blob = new Blob([compressedImageBuffer]);
				const file = new File([blob], `img-${user.id}-${nanoid()}.png`);

				const response = await utapi.uploadFiles(file, {
					metadata: {
						usedId: user.id,
					},
				});

				console.log("Finished uploading image.");

				if (!response?.data?.url)
					return {
						success: false,
						message: "Failed to upload image",
					} satisfies ImageGenerationResult;

				await tx.user.update({
					where: {
						id: user.id,
					},
					data: {
						credits: {
							decrement: 1,
						},
						images: {
							create: {
								imageUrl: response.data.url,
								prompt: parsed.data.prompt,
								revisedPrompt:
									image.data[0].revised_prompt ?? parsed.data.prompt,
							},
						},
					},
				});

				return {
					success: true,
					imgUrl: response.data.url,
				} satisfies ImageGenerationResult;
			},
			{
				timeout: 60000,
			},
		);

		revalidatePath("/");
		return res;
	} catch (err) {
		console.error(err);
		return {
			success: false,
			message: "Unexpected error. Please try again later.",
		} satisfies ImageGenerationResult;
	}
};
