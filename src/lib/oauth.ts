import "server-only";

import { Google } from "arctic";
import { getBaseUrl } from "./utils";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
	throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

export const google = new Google(
	clientId,
	clientSecret,
	`${getBaseUrl()}/api/auth/google`,
);
