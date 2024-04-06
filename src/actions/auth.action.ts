"use server";

import { SignInSchema, SignUpSchema } from "@/schemas";
import { z } from "zod";

import { lucia, validateRequest } from "@/lib/auth";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";

import prisma from "@/lib/db";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";

import { getBaseUrl } from "@/lib/utils";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
	const parsed = SignUpSchema.safeParse(values);

	try {
		if (!parsed.success) {
			throw new Error("Invalid form values");
		}

		const hashedPassword = await new Argon2id().hash(values.password);
		const userId = generateId(15);

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [
					{
						username: parsed.data.username,
					},
					{
						email: parsed.data.email,
					},
				],
			},
		});

		if (existingUser) {
			throw new Error("User already exists");
		}

		await prisma.user.create({
			data: {
				id: userId,
				email: parsed.data.email,
				username: parsed.data.username,
				hashedPassword,
			},
		});

		const verificationToken = await createEmailVerificationToken(
			userId,
			parsed.data.email,
		);

		const verificationLink = `${getBaseUrl()}/email-verification/${verificationToken}`;

		await resend.emails.send({
			from: "AI Image Generator <noreply@whxtest.pl>",
			to: [parsed.data.email],
			subject: "Verify your email address - AI Image Generator",
			html: `Please click this link to verify your email address: <a href="${verificationLink}">activate your account</a>`,
		});

		return {
			success: true,
			data: {
				userId,
			},
		};
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (err: any) {
		console.log(err);
		throw new Error(
			err || "Some error occurred while signing up. Please try again later.",
		);
	}
};

export const signIn = async (values: z.infer<typeof SignInSchema>) => {
	const parsed = SignInSchema.safeParse(values);
	if (!parsed.success) {
		throw new Error("Invalid form values");
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			username: parsed.data.username,
		},
	});

	if (!existingUser) {
		throw new Error("User does not exist");
	}

	if (!existingUser.emailVerified) {
		throw new Error("Email not verified. Please verify your email.");
	}

	const isValidPassword = await new Argon2id().verify(
		existingUser.hashedPassword,
		values.password,
	);

	if (!isValidPassword) {
		throw new Error("Invalid username or password");
	}

	const session = await lucia.createSession(existingUser.id, {
		expiresIn: 60 * 60 * 24 * 30,
	});

	const sessionCookie = lucia.createSessionCookie(session.id);

	cookies().set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes,
	);

	return {
		success: true,
		data: {
			userId: existingUser.id,
		},
	};
};

export const signOut = async () => {
	try {
		const { session } = await validateRequest();

		if (!session) {
			throw new Error("No session found");
		}

		await lucia.invalidateSession(session.id);

		const sessionCookie = lucia.createBlankSessionCookie();

		cookies().set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		);
	} catch (err) {
		throw new Error(
			"Some error occurred while signing out. Please try again later.",
		);
	}
};

export const verifyEmail = async (token: string) => {
	if (!token) {
		return {
			success: false,
			message: "Invalid token",
		};
	}

	return await prisma.$transaction(async (tx) => {
		const foundToken = await tx.emailVerificationToken.findUnique({
			where: {
				id: token,
			},
		});

		if (!foundToken) {
			return {
				success: false,
				message: "Invalid token",
			};
		}

		await tx.emailVerificationToken.delete({
			where: {
				id: token,
			},
		});

		if (!isWithinExpirationDate(foundToken.expiresAt)) {
			return {
				success: false,
				message: "Token expired.",
			};
		}

		const user = await tx.user.findUnique({
			where: {
				id: foundToken.userId,
			},
		});

		if (!user) {
			return {
				success: false,
				message: "User not found",
			};
		}

		await lucia.invalidateUserSessions(user.id);

		await tx.user.update({
			where: {
				id: user.id,
			},
			data: {
				emailVerified: true,
			},
		});

		return {
			success: true,
			message: "Email verified. You can sign in.",
		};
	});
};

export async function createEmailVerificationToken(
	userId: string,
	email: string,
): Promise<string> {
	// optionally invalidate all existing tokens
	await prisma.emailVerificationToken.deleteMany({
		where: {
			userId,
		},
	});
	const tokenId = generateId(40);

	await prisma.emailVerificationToken.create({
		data: {
			id: tokenId,
			email,
			expiresAt: createDate(new TimeSpan(2, "h")),
			user: {
				connect: {
					id: userId,
				},
			},
		},
	});
	return tokenId;
}
