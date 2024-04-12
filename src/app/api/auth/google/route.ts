import { lucia } from "@/lib/auth";
import prisma from "@/lib/db";
import { google } from "@/lib/oauth";
import { addStripeCustomer, stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";
import { Session, generateId } from "lucia";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type GoogleUser = {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	picture: string;
	locale: string;
};

type TransactionResponse = {
	success: boolean;
	message: string;
};

export const GET = async (req: NextRequest) => {
	const url = req.nextUrl;

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	if (!code || !state) {
		return Response.json(
			{
				error: "Invalid request",
			},
			{
				status: 400,
			},
		);
	}

	const savedCodeVerifier = cookies().get("codeVerifier")?.value;
	const savedState = cookies().get("state")?.value;

	if (!savedCodeVerifier || !savedState) {
		return Response.json(
			{
				error: "Invalid request",
			},
			{
				status: 400,
			},
		);
	}

	if (savedState !== state) {
		return Response.json(
			{
				error: "State does not match.",
			},
			{
				status: 400,
			},
		);
	}

	const { accessToken, idToken, accessTokenExpiresAt, refreshToken } =
		await google.validateAuthorizationCode(code, savedCodeVerifier);

	const googleRes = await fetch(
		"https://www.googleapis.com/oauth2/v1/userinfo",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			method: "GET",
		},
	);

	const googleData = (await googleRes.json()) as GoogleUser;

	const res: TransactionResponse = await prisma.$transaction(async (tx) => {
		const userExist = await tx.user.findUnique({
			where: {
				email: googleData.email,
				accountCreatedByOauth: false,
			},
		});

		if (userExist) {
			return {
				success: false,
				message: "User already exists. Please sign in.",
			};
		}

		const user = await tx.user.findUnique({
			where: {
				id: googleData.id,
			},
		});

		if (!user) {
			// User not found. Creating a new user.

			const newStripeCustomer = await addStripeCustomer({
				email: googleData.email,
			});

			if (!newStripeCustomer) {
				return {
					success: false,
					message: "Failed to create a new Stripe customer.",
				};
			}

			const newUser = await tx.user.create({
				data: {
					id: googleData.id,
					email: googleData.email,
					username: googleData.email,
					stripeCustomerId: newStripeCustomer.id,
					accountCreatedByOauth: true,
				},
			});

			if (!newUser) {
				return {
					success: false,
					message: "Failed to create a new user. Please try again.",
				};
			}

			const createdOauthAccount = await tx.oauthAccount.create({
				data: {
					provider: "google",
					providerUserId: googleData.id,
					accessToken,
					expiresAt: accessTokenExpiresAt,
					refreshToken,
					user: {
						connect: {
							id: newUser.id,
						},
					},
				},
			});

			if (!createdOauthAccount) {
				return {
					success: false,
					message: "Failed to create a new OAuth account. Please try again.",
				};
			}
		} else {
			// User found. Updating the user's Oauth account.
			const updatedOauthAccount = await tx.oauthAccount.update({
				where: {
					userId: user.id,
				},
				data: {
					accessToken,
					expiresAt: accessTokenExpiresAt,
					refreshToken,
				},
			});

			if (!updatedOauthAccount) {
				return {
					success: false,
					message:
						"Failed to update the user's OAuth account. Please try again.",
				};
			}
		}

		return {
			success: true,
			message: "Successfully created a new user. Redirecting to the dashboard.",
		};
	});

	if (res.success) {
		const session = await lucia.createSession(googleData.id, {
			expiresIn: 60 * 60 * 24 * 30,
		});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies().set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		);

		cookies().set("state", "", {
			expires: new Date(0),
		});

		cookies().set("codeVerifier", "", {
			expires: new Date(0),
		});

		return NextResponse.redirect(new URL("/", getBaseUrl()), {
			status: 302,
		});
	}
	// return Response.json(
	// 	{
	// 		success: false,
	// 		error: res.message,
	// 	},
	// 	{
	// 		status: 400,
	// 	},
	// );
	return new Response(null, {
		status: 400,
	});
};
