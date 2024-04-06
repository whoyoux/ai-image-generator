"use client";

import { verifyEmail } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const EmailVerificationPage = async ({
	params,
}: { params: { token: string } }) => {
	const router = useRouter();

	if (!params.token) return <div>Invalid token</div>;

	const verify = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const res = await verifyEmail(params.token);
		if (res.success) {
			toast.success(res.message);
			router.push("/");
		} else {
			toast.error(res.message);
		}
	};

	return (
		<div>
			<form onSubmit={verify} className="flex flex-col items-center gap-4">
				<h2 className="text-xl font-semibold">
					Click here to verify your email address
				</h2>
				<Button type="submit">Verify my email</Button>
			</form>
		</div>
	);
};

export default EmailVerificationPage;
