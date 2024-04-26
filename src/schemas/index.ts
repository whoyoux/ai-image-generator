import { PLANS } from "@prisma/client";
import { z } from "zod";

export const SignUpSchema = z
	.object({
		email: z
			.string()
			.email({ message: "Invalid email!" })
			.min(4, { message: "Minimum 4 characters!" })
			.max(100, { message: "Maximum 20 characters!" }),
		username: z
			.string()
			.min(4, { message: "Minimum 4 characters!" })
			.max(100, { message: "Maximum 20 characters!" }),
		password: z
			.string()
			.min(8, { message: "Minimum 8 characters!" })
			.max(100, { message: "Maximum 100 characters!" }),
		confirmPassword: z
			.string()
			.min(8, { message: "Minimum 8 characters!" })
			.max(100, { message: "Maximum 100 characters!" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const SignInSchema = z.object({
	email: z
		.string()
		.email()
		.min(4, { message: "Minimum 4 characters!" })
		.max(100, { message: "Maximum 20 characters!" }),
	password: z
		.string()
		.min(8, { message: "Minimum 8 characters!" })
		.max(100, { message: "Maximum 100 characters!" }),
});

export const StyleEnum = z.enum([
	"animation",
	"cartoon",
	"detailed",
	"drawing",
	"high-resolution",
	"lego",
	"modern",
	"oil painting",
	"pointillism",
	"professional photography",
	"traditional",
	"vector art",
	"watercolor",
	"3D",
	"isometric",
	"photo-realistic",
	"pixar",
	"low poly",
	"flat design",
	"minimalist",
	"material design",
	"abstract",
	"art deco",
	"anime",
	"custom",
]);

export const ImageGeneratorPromptSchema = z
	.object({
		prompt: z
			.string()
			.min(4, { message: "Minimum 4 characters!" })
			.max(1000, { message: "Maximum 1000 characters!" }),
		style: StyleEnum,
		customStyle: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.style === "custom" && !data.customStyle) {
				return false;
			}
			return true;
		},
		{
			message: "You selected custom style but did not provide a custom style!",
			path: ["style"],
		},
	);

export const SpeechVoicesEnum = z.enum([
	"alloy",
	"echo",
	"fable",
	"nova",
	"onyx",
	"shimmer",
]);

export const MINIMUM_SPEECH_SPEED = 0.25;
export const MAXIMUM_SPEECH_SPEED = 4;

export const SpeechGeneratorPromptSchema = z.object({
	text: z
		.string()
		.min(4, { message: "Minimum 4 characters!" })
		.max(1000, { message: "Maximum 1000 characters!" }),
	voice: SpeechVoicesEnum,
	speed: z
		.number()
		.min(MINIMUM_SPEECH_SPEED, {
			message: "Minimum speed is 0.25",
		})
		.max(MAXIMUM_SPEECH_SPEED, {
			message: "Maximum speed is 4",
		})
		.default(1),
});

export const checkoutSchema = z.object({
	plan: z.nativeEnum(PLANS),
});
