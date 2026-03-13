import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { onBoardUser } from "@/modules/auth/actions";

async function Layout({ children }: { children: React.ReactNode }) {
	await onBoardUser();
	return (
		<main className="flex flex-col min-h-screen relative overflow-x-hidden ">
			{/* Background */}
			<div
				className="fixed inset-0 z-0 
			bg-background 
			bg-[radial-gradient(#dadde2_1px,transparent_1px)] 
			dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)]
			bg-size-[16px_16px]"
			/>

			{/* Content */}
			<div className={`flex-1 w-full mt-20 relative z-10`}>{children}</div>
		</main>
	);
}

export default Layout;
