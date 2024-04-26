import { validateRequest } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getUserImages, getUserSpeeches } from "@/lib/db-queries";

import { Image as ImageFromDB, Speech } from "@prisma/client";
import CopyButton from "./copy-button";
import ShareButton from "./share-button";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const Dashboard = async () => {
	const { user } = await validateRequest();
	if (!user) redirect("/sign-in");

	const [images, speeches] = await Promise.all([
		getUserImages(user.id),
		getUserSpeeches(user.id),
	]);

	return (
		<div className="flex flex-col gap-8">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<UserImages images={images} />
			<UserSpeeches speeches={speeches} />
		</div>
	);
};

const UserImages = ({ images }: { images: ImageFromDB[] }) => {
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-xl font-medium">Your generated images:</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:ml-0 mx-auto gap-2">
				{images.map((image) => (
					<div key={image.id}>
						<Dialog>
							<DialogTrigger asChild>
								<Image
									src={image.imageUrl}
									alt={image.revisedPrompt}
									width={200}
									height={200}
									className="rounded-lg bg-card border cursor-pointer"
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
	);
};

const UserSpeeches = ({ speeches }: { speeches: Speech[] }) => {
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-xl font-medium">Your generated speeches:</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
				{speeches.map((speech, index) => (
					<Card key={speech.id} className="">
						<CardHeader>
							<CardTitle>
								{speech.label} {speeches.length - index}
							</CardTitle>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<CardDescription className="line-clamp-3 text-left">
											{speech.text}
										</CardDescription>
									</TooltipTrigger>
									<TooltipContent>
										<CardDescription className="max-w-[500px] p-4">
											{speech.text}
										</CardDescription>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							{/* <p className="text-muted-foreground line-clamp-3">
								{speech.text}
							</p> */}
						</CardHeader>
						<CardContent>
							{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
							<audio controls>
								<source src={speech.speechUrl} type="audio/mp3" />
								Your browser does not support the audio element. See your new
								generated speech on your dashboard.
							</audio>
						</CardContent>
						{/* <CardFooter>
							<p>Share</p>
						</CardFooter> */}
					</Card>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
