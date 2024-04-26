import "server-only";

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	throw new Error("Missing Stripe secret key");
}

export const stripe = new Stripe(key, {
	apiVersion: "2023-10-16",
	typescript: true,
});

export const addStripeCustomer = async ({ email }: { email: string }) => {
	if (!email) {
		throw new Error("Invalid user data");
	}

	try {
		const stripeCustomer = await stripe.customers.create({
			email,
		});

		return stripeCustomer;
	} catch (err) {
		throw new Error(`Server error: ${err}`);
	}
};
