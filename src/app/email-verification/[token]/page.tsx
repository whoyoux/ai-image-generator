import EmailVerificationForm from "./form";

const EmailVerificationPage = async ({
	params,
}: { params: { token: string } }) => {
	if (!params.token) return <div>Invalid token</div>;

	return (
		<div>
			<EmailVerificationForm token={params.token} />
		</div>
	);
};

export default EmailVerificationPage;
