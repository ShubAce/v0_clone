"use client";

import React from "react";
import { signIn } from "@/lib/auth-client";

const SignIn = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-3xl font-bold mb-8">Sign In</h1>
			<div className="flex flex-col gap-4">
				<button
					onClick={() => signIn.social({ provider: "github" })}
					className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-5 transition-colors hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-64"
				>
					Sign In with GitHub
				</button>
				<button
					onClick={() => signIn.social({ provider: "google" })}
					className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/8 px-5 transition-colors hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-64"
				>
					Sign In with Google
				</button>
			</div>
		</div>
	);
};

export default SignIn;
