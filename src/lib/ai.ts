import "server-only";

import { StyleEnum } from "@/schemas";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

import { z } from "zod";

const openai = new OpenAI();

export async function generateImageBase64(
	userId: string,
	prompt: string,
	style: z.infer<typeof StyleEnum>,
	customStyle?: string,
) {
	return await openai.images.generate({
		model: "dall-e-3",
		// quality: "hd",
		style: "vivid",
		// prompt: `Create an image of ${prompt} in the style of ${style}. Do not add things that are not in the prompt.`,
		prompt: `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: ${prompt} in the style of ${
			style === "custom" ? customStyle : style
		}.`,
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

export async function generateImageVariations() {
	// return await openai.images.createVariation({
	// })
}
