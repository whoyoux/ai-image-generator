import { SpeechVoicesEnum, StyleEnum } from "@/schemas";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";
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

export async function generateSpeechFromText(
	text: string,
	voice: SpeechCreateParams["voice"],
	speed: SpeechCreateParams["speed"],
) {
	return await openai.audio.speech.create({
		model: "tts-1",
		voice,
		input: text,
		speed,
	});
}
