"use server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";
import { checkoutSchema } from "@/schemas";
import { PLANS } from "@prisma/client";
import { redirect } from "next/navigation";

type CheckoutResponse =
	| {
			success: true;
			url: string;
	  }
	| {
			success: false;
			message: string;
	  };

const getPriceIDFromPlan = (plan: PLANS) => {
	switch (plan) {
		case PLANS.BASIC:
			return process.env.STRIPE_BASIC_PRICE_ID;
		case PLANS.MEDIUM:
			return process.env.STRIPE_MEDIUM_PRICE_ID;
		case PLANS.PRO:
			return process.env.STRIPE_PRO_PRICE_ID;
		default:
			return process.env.STRIPE_BASIC_PRICE_ID;
	}
};

export const checkout = async (
	formData: FormData,
): Promise<CheckoutResponse> => {
	const parsedFormData = checkoutSchema.safeParse(
		Object.fromEntries(formData.entries()),
	);

	if (!parsedFormData.success) {
		return {
			success: false,
			message: "Invalid form data",
		};
	}

	const { user } = await validateRequest();

	if (!user) {
		return {
			success: false,
			message: "Unauthorized",
		};
	}

	const newOrder = await prisma.order.create({
		data: {
			user: {
				connect: {
					id: user.id,
				},
			},
			plan: parsedFormData.data.plan,
		},
	});

	const stripeSession = await stripe.checkout.sessions.create({
		// success_url: `${getBaseUrl()}/billing?session_id={CHECKOUT_SESSION_ID}`,
		success_url: `${getBaseUrl()}/`,
		cancel_url: `${getBaseUrl()}/billing`,
		payment_method_types: ["card"],
		mode: "payment",
		line_items: [
			{
				price: getPriceIDFromPlan(parsedFormData.data.plan),
				quantity: 1,
			},
		],
		customer: user.stripeCustomerId,
		metadata: {
			orderId: newOrder.id,
			plan: parsedFormData.data.plan,
		},
	});

	if (!stripeSession?.url) {
		await prisma.order.update({
			where: {
				id: newOrder.id,
			},
			data: {
				canceled: true,
				canceledAt: new Date(),
				canceledBy: "Stripe API",
			},
		});

		return {
			success: false,
			message: "Failed to create session",
		};
	}

	redirect(stripeSession.url);
};
