import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import CopyButton from "./copy-button";
import ShareButton from "./share-button";

const Dashboard = async () => {
	const { user } = await validateRequest();
	if (!user) redirect("/sign-in");

	const images = await prisma.image.findMany({
		where: {
			userId: user.id,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-medium">Your generated images:</h2>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-row lg:ml-0 mx-auto gap-2">
					{images.map((image) => (
						<div key={image.id}>
							<Dialog>
								<DialogTrigger asChild>
									<Image
										src={image.imageUrl}
										alt={image.revisedPrompt}
										width={200}
										height={200}
										className="rounded-lg"
										sizes="200px"
									/>
								</DialogTrigger>
								<DialogContent className="w-[90vw] h-auto max-w-screen-lg flex flex-col gap-8">
									<DialogHeader>
										<DialogTitle>{image.prompt}</DialogTitle>
										{/* <DialogDescription>{image.prompt}</DialogDescription> */}
									</DialogHeader>
									<div className="w-full flex items-center justify-center">
										<div className="w-full relative aspect-square bg-card border">
											<Image
												src={image.imageUrl}
												fill
												alt={image.revisedPrompt}
												className="rounded-md aspect-square z-[70]"
												quality={100}
											/>
											<span className="z-60 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
												Loading image...
											</span>
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<div className="flex gap-4">
											<CopyButton imgUrl={image.imageUrl} />
											<ShareButton imgUrl={image.imageUrl} />
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
