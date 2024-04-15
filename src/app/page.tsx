import HeroSection from "@/components/hero";
import prisma from "@/lib/db";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";

import battleImg from "@/assets/images/battle.png";
import crashImg from "@/assets/images/crash.png";
import notebookImg from "@/assets/images/notebook.png";
import processImg from "@/assets/images/process.png";
import speakingImg from "@/assets/images/speaking.png";

export const revalidate = 1200; // 1 hour;

export default async function Home() {
	const images = await prisma.image.findMany({
		where: {
			isPublic: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 6,
		select: {
			id: true,
			imageUrl: true,
			prompt: true,
		},
	});

	return (
		<div className="flex flex-col gap-36 pb-36">
			<HeroSection />

			<Section
				title="Create Stunning Visuals"
				paragraph="Explore the limitless possibilities of artificial intelligence to bring your concepts to life. With AI Genie, you can effortlessly generate high-quality images and lifelike speech."
				image={battleImg}
				altImage="Jedi battle"
				isReversed
			/>

			<Section
				title="Transform Ideas into Reality"
				paragraph="Let your imagination run wild with AI-powered image generation.
				Generate captivating visuals for your projects, presentations, or
				creative endeavors with just a few clicks."
				image={crashImg}
				altImage="Stock crash day in lego style"
			/>

			<Section
				title="Give Voice to Your Ideas"
				paragraph="Elevate your content with natural-sounding speech generated by AI. Whether you need narration for videos, voiceovers for presentations, or personalized messages, AI Genie empowers you to convey your message effectively."
				image={speakingImg}
				altImage="Speaking image"
				isReversed
			/>

			<Section
				title="Simple and Seamless Process"
				paragraph="Using AI Genie is easy! Simply choose the desired function—image generation or speech generation—upload any necessary inputs, and let our advanced algorithms do the rest. Within moments, you'll have your customized output ready to use."
				image={processImg}
				altImage="Simplicity of use image"
			/>

			<Section
				title="Your Creations, Your Ownership"
				paragraph="At AI Genie, every image and speech you generate belongs exclusively to you. We respect your creative ownership and do not claim any rights over your content. Create with confidence, knowing that your creations are yours to use freely."
				image={notebookImg}
				altImage="Notebook with Happy Tuesday text"
				isReversed
			/>

			<Section
				title="Start Creating Today"
				paragraph="Join the AI Genie community and start generating images and speech effortlessly. Sign up now to unlock the full potential of AI-driven creativity!"
				withImage={false}
			/>

			<section className="max-w-screen-lg mx-auto w-full">
				<h2 className="text-2xl md:text-4xl font-semibold text-center">
					Recent Creations
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mt-8">
					{images.map((image) => (
						<div className="relative aspect-square" key={image.id}>
							<Image
								src={image.imageUrl}
								alt={image.prompt}
								className="rounded-lg"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								loading="eager"
							/>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

type SectionProps = {
	title: string;
	paragraph: string;
	withImage?: boolean;
	image?: StaticImageData;
	altImage?: string;
	isReversed?: boolean;
};

const Section = ({
	title,
	paragraph,
	withImage = true,
	image,
	altImage,
	isReversed = false,
}: SectionProps) => {
	return (
		<section className="max-w-screen-lg mx-auto w-full flex flex-col lg:items-center justify-start gap-12">
			<h2 className="text-2xl md:text-4xl font-semibold">{title}</h2>
			<div
				className={cn(
					"flex flex-col gap-8",
					isReversed ? "lg:flex-row-reverse" : "lg:flex-row",
				)}
			>
				{withImage && image && altImage && (
					<div className="w-full aspect-square relative max-w-[400px] flex-1 mx-auto">
						<Image
							src={image}
							fill
							alt={altImage}
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="rounded-lg"
							placeholder="blur"
						/>
					</div>
				)}
				<p className="text-xl md:text-2xl text-card-foreground flex-1">
					{paragraph}
				</p>
			</div>
		</section>
	);
};
