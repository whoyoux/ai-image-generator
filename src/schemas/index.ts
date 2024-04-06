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
			.max(20, { message: "Maximum 20 characters!" }),
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
	username: z
		.string()
		.min(4, { message: "Minimum 4 characters!" })
		.max(20, { message: "Maximum 20 characters!" }),
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
]);

export const PromptSchema = z.object({
	prompt: z
		.string()
		.min(4, { message: "Minimum 4 characters!" })
		.max(1000, { message: "Maximum 1000 characters!" }),
	style: StyleEnum,
});
