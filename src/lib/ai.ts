import { StyleEnum } from "@/schemas";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI();

export async function generateImageBase64(
	userId: string,
	prompt: string,
	style: z.infer<typeof StyleEnum>,
) {
	return await openai.images.generate({
		model: "dall-e-3",
		prompt: `Create an image of ${prompt} in the style of ${style}. Do not add things that are not in the prompt.`,
		user: userId,
		response_format: "b64_json",
	});
}
