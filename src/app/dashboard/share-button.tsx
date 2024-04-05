"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ShareButton = ({ imgUrl }: { imgUrl: string }) => {
	const share = async () => {
		const blob = await fetch(imgUrl).then((res) => res.blob());

		const data = {
			files: [
				new File([blob], "file.png", {
					type: blob.type,
				}),
			],
			title: "AI Image Generator",
			text: "Check out this image I generated using AI",
		};

		if (navigator.canShare(data)) {
			navigator.share(data);
		} else {
			toast.error("Your browser does not support the Web Share API");
		}
	};
	return (
		<Button
			variant="outline"
			className="flex-1"
			onClick={async () => await share()}
		>
			Share
		</Button>
	);
};

export default ShareButton;
