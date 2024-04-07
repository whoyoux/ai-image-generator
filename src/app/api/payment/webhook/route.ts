import prisma from "@/lib/db";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { getCreditsFromPlan } from "@/lib/utils";
import { PLANS } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: NextRequest) {
	const body = await request.text();
	const sig = headers().get("stripe-signature") as string;

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(
			body,
			sig,
			WEBHOOK_SECRET,
		);
	} catch (err) {
		return new Response(`Webhook error: ${err}`, {
			status: 400,
		});
	}

	switch (event.type) {
		case "checkout.session.expired": {
			const session = event.data.object as Stripe.Checkout.Session;
			if (!session)
				return new Response("There is something wrong with session object. ", {
					status: 400,
				});

			const orderId = session.metadata?.orderId;
			if (!orderId)
				return new Response("There is something wrong with orderId. ", {
					status: 400,
				});

			try {
				await prisma.order.update({
					where: {
						id: orderId,
					},
					data: {
						canceled: true,
						canceledAt: new Date(),
					},
				});
			} catch (err) {
				return new Response(`Database error: ${err}`, {
					status: 500,
				});
			}

			break;
		}
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			if (!session)
				return new Response("There is something wrong with session object. ", {
					status: 400,
				});

			const orderId = session.metadata?.orderId;
			const plan = session.metadata?.plan as PLANS | undefined;

			if (!orderId || !plan || !session.customer)
				return new Response("There is something wrong with orderId. ", {
					status: 400,
				});

			const stripeCustomerId = session.customer.toString();

			const user = await prisma.user.findUnique({
				where: {
					stripeCustomerId: stripeCustomerId,
				},
			});

			if (!user) {
				await prisma.order.update({
					where: {
						id: orderId,
					},
					data: {
						canceled: true,
						canceledAt: new Date(),
						canceledBy: "User not found",
					},
				});

				return new Response("User not found", {
					status: 404,
				});
			}

			try {
				await prisma.order.update({
					where: {
						id: orderId,
					},
					data: {
						paid: true,
						paidAt: new Date(),
					},
				});

				await prisma.user.update({
					where: {
						id: user.id,
					},
					data: {
						credits: {
							increment: getCreditsFromPlan(plan),
						},
					},
				});

				revalidatePath("/");

				await resend.emails.send({
					from: "AI Image Generator <noreply@whxtest.pl>",
					to: [user.email],
					subject: "Thank you for your purchase - AI Image Generator",
					html: `Thank you for your purchase. You have received ${getCreditsFromPlan(
						plan,
					)} credits.`,
				});
			} catch (err) {
				console.log(`[CRITICAL ERROR] Error updating order ${err}`);
				return new Response(`Database error: ${err}`, {
					status: 500,
				});
			}
			break;
		}
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	return new Response("ok", { status: 200 });
}
