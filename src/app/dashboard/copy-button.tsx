"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CopyButton = ({ imgUrl }: { imgUrl: string }) => {
	const copy = () => {
		navigator.clipboard.writeText(imgUrl);
		toast.success("Link copied to clipboard");
	};
	return (
		<Button className="flex-1" onClick={copy} variant="outline">
			Copy link
		</Button>
	);
};

export default CopyButton;
