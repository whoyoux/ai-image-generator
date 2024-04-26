import "server-only";
import prisma from "./db";

export async function getImages() {
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
	return images;
}

export async function getUserImages(userId: string) {
	const images = await prisma.image.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return images;
}

export async function getUserSpeeches(userId: string) {
	const speeches = await prisma.speech.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return speeches;
}
