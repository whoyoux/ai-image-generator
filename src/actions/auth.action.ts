"use server";

import { SignInSchema, SignUpSchema } from "@/schemas";
import { z } from "zod";

import { lucia, validateRequest } from "@/lib/auth";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";

import prisma from "@/lib/db";

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
				username: parsed.data.username,
			},
		});

		if (existingUser) {
			throw new Error("User already exists");
		}

		await prisma.user.create({
			data: {
				id: userId,
				username: parsed.data.username,
				hashedPassword,
			},
		});

		const session = await lucia.createSession(userId, {
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
