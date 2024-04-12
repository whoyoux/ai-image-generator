import { APP_NAME } from "@/config";
import Link from "next/link";
import React from "react";

const Footer = () => {
	return (
		<footer className="w-full border-t bg-card flex flex-col p-8">
			<h4>{APP_NAME}</h4>
			<p className="text-sm text-card-foreground">
				created by <Link href="https://github.com/whoyoux">whoyoux</Link>
			</p>
		</footer>
	);
};

export default Footer;
