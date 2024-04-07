import { checkout } from "@/actions/payments.action";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth";
import { PLANS } from "@prisma/client";

const BillingPage = async () => {
	const { user } = await validateRequest();
	const isLoggedIn = !!user;
	return (
		<div className="max-w-screen-lg mx-auto">
			<div className="">
				<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
					Buy more credits
				</h2>
				<p className="mx-auto text-center max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
					Start with a free plan. Upgrade, downgrade, or cancel anytime.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
				<Card
					label="10 credits"
					cost={2}
					description="Starter pack"
					items={["Full rights to generated images", "Email support"]}
					active={isLoggedIn}
					plan={PLANS.BASIC}
				/>
				<Card
					label="30 credits"
					cost={5}
					description="Professional"
					items={[
						"Everything from Starter Pack",
						"High priority support",
						"More credits",
					]}
					active={isLoggedIn}
					plan={PLANS.MEDIUM}
				/>
				<Card
					label="70 credits"
					cost={10}
					description="Above and beyond"
					items={[
						"Everything from Professional Pack",
						"Even higher priority support",
						"Even more credits",
					]}
					active={isLoggedIn}
					plan={PLANS.PRO}
				/>
			</div>
			<p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-10">
				We accept all major credit cards. By proceeding, you agree to our Terms
				of Service.
			</p>
		</div>
	);
};

const Card = ({
	label,
	cost,
	description,
	items,
	active,
	plan,
}: {
	label: string;
	cost: number;
	description: string;
	items: string[];
	active: boolean;
	plan: PLANS;
}) => {
	return (
		<form className="flex flex-col border rounded-lg" action={checkout}>
			<div className="flex-1 grid items-center justify-center p-6">
				<div className="space-y-3 text-center">
					<h3 className="text-xl font-bold">{label}</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{description}
					</p>
					<div className="text-2xl font-bold">{`$${cost}`}</div>
				</div>
			</div>

			<div className="flex flex-col gap-2 p-4 flex-1">
				<ul className="grid gap-2 text-sm text-gray-500 divide-y dark:text-gray-400">
					{items.map((item) => (
						<li className="flex items-center py-2" key={item}>
							{item}
						</li>
					))}
				</ul>
			</div>

			<div className="p-4">
				<input type="hidden" name="plan" value={plan} />
				<Button className="w-full" size="lg" disabled={!active} type="submit">
					Pay ${cost}
				</Button>
			</div>
		</form>
	);
};

export default BillingPage;
