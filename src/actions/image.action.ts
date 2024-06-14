"use server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/db";
import { ImageGeneratorPromptSchema } from "@/schemas";
import type { z } from "zod";

import { generateImageBase64 } from "@/lib/ai";
import { checkRateLimit } from "@/lib/upstash";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { BadRequestError } from "openai";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const CREDIT_PER_IMAGE_GENERATE = 1;

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
	data: z.infer<typeof ImageGeneratorPromptSchema>,
): Promise<ImageGenerationResult> => {
	const parsed = ImageGeneratorPromptSchema.safeParse(data);

	try {
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
				message: "Unauthorized",
			};
		}

		const res: ImageGenerationResult = await prisma.$transaction(
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

				if (foundUser.credits < CREDIT_PER_IMAGE_GENERATE) {
					return {
						success: false,
						message: "Not enough credits",
					};
				}

				console.log("Started generating image.");

				const image = await generateImageBase64(
					user.id,
					parsed.data.prompt,
					parsed.data.style,
					parsed.data.customStyle,
				);

				console.log("Finished generating image.");

				if (!image.data[0].b64_json)
					return {
						success: false,
						message: "Failed to generate image",
					};

				console.log("Started compressing image.");

				const file = await compressImage(image.data[0].b64_json, user.id);

				console.log("Finished compressing image.");

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
					};

				await tx.user.update({
					where: {
						id: user.id,
					},
					data: {
						credits: {
							decrement: CREDIT_PER_IMAGE_GENERATE,
						},
						images: {
							create: {
								imageUrl: response.data.url,
								prompt: parsed.data.prompt,
								style: parsed.data.style,
								revisedPrompt:
									image.data[0].revised_prompt ?? parsed.data.prompt,
								customStyle:
									parsed.data.style === "custom"
										? parsed.data.customStyle
										: null,
							},
						},
					},
				});

				return {
					success: true,
					imgUrl: response.data.url,
				};
			},
			{
				timeout: 300000, // 5 minutes
			},
		);

		revalidatePath("/");
		return res;
	} catch (err) {
		console.error(err);
		if (err instanceof BadRequestError) {
			return {
				success: false,
				message: err.message,
			};
		}

		return {
			success: false,
			message: "Unexpected error. Please try again later.",
		};
	}
};

async function compressImage(
	imageInBase64: string,
	userId: string,
): Promise<File> {
	const imgBuffer = Buffer.from(imageInBase64, "base64");
	const compressedImageBuffer = await sharp(imgBuffer)
		.withMetadata()
		.png({
			quality: 100,
			compressionLevel: 9,
		})
		.toBuffer();

	const blob = new Blob([compressedImageBuffer]);
	const file = new File([blob], `img-${userId}-${nanoid()}.png`);
	return file;
}
