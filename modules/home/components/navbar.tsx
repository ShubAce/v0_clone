"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
	const { data: session } = useSession();

	return (
		<nav className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent">
			<div className="max-w-5xl mx-auto w-full flex justify-between items-center">
				<Link
					href={"/"}
					className="flex items-center gap-2"
				>
					<Image
						src={"/logo.svg"}
						alt="Vibe"
						width={32}
						height={32}
						className="shrink 0 invert dark:invert-0"
					/>
				</Link>

				{!session ? (
					<div className="flex gap-2">
						<Link href="/sign-in">
							<Button
								variant={"outline"}
								size={"lg"}
							>
								Sign In
							</Button>
						</Link>
						<Link href="/sign-up">
							<Button size={"lg"}>Sign Up</Button>
						</Link>
					</div>
				) : (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-4 outline-none">
								{session.user.image ? (
									<img
										src={session.user.image}
										alt={session.user.name || "User"}
										className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105"
									/>
								) : (
									<div className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-sm font-medium">
										{session.user.name?.charAt(0) || session.user.email.charAt(0)}
									</div>
								)}
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56"
						>
							<DropdownMenuLabel className="flex flex-col">
								<span>{session.user.name}</span>
								<span className="text-xs text-muted-foreground font-normal">{session.user.email}</span>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-red-500 cursor-pointer"
								onClick={() => signOut()}
							>
								<LogOut className="w-4 h-4 mr-2" />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
