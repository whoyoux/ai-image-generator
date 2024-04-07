import { signOut } from "@/actions/auth.action";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";
import React from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleHelp, CreditCard, LogOut, Settings, User } from "lucide-react";

const Header = async () => {
	const { user } = await validateRequest();

	return (
		<header className="w-full flex items-center justify-between px-4 md:px-8 py-6 border-b mb-10">
			<Link href="/">
				<h1 className="text-lg md:text-xl font-semibold">Ai Image Generator</h1>
			</Link>
			<div className="flex items-center gap-4">
				{user ? (
					<div className="flex items-center gap-4">
						<Link href="/billing">
							<p className="hidden md:block text-sm text-muted-foreground hover:underline underline-offset-4">
								You have <span className="text-primary">{user.credits}</span>{" "}
								credits left
							</p>
						</Link>
						<UserDropdown username={user.username} />
					</div>
				) : (
					<Link href="/sign-in">
						<Button>Sign in</Button>
					</Link>
				)}
				<ThemeSwitcher />
			</div>
		</header>
	);
};

const UserDropdown = ({ username }: { username: string }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">{username}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link href="/dashboard">
						<DropdownMenuItem>
							<User className="mr-2 h-4 w-4" />
							<span>Profile</span>
							<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<Link href="/billing">
						<DropdownMenuItem>
							<CreditCard className="mr-2 h-4 w-4" />
							<span>Billing</span>
							<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
					<DropdownMenuItem>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CircleHelp className="mr-2 h-4 w-4" />
						<span>FAQ</span>
						<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<SignOutButton />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const SignOutButton = () => {
	return (
		<form action={signOut}>
			<button type="submit" className="w-full">
				<DropdownMenuItem>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Log out</span>
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</button>
		</form>
	);
};

export default Header;
