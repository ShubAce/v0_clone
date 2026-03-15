"use client";
import { Button } from "@/components/ui/button";
import { inngest } from "@/inngest/client";
import Navbar from "@/modules/home/components/navbar";
import ProjectForm from "@/modules/home/components/project-form";
import ProjectList from "@/modules/home/components/project-list";
import Image from "next/image";
export default function Home() {
	return (
		<>
			<Navbar />
			<div className="flex items-center justify-center w-full px-4 py-8">
				<div className="max-w-5xl w-full">
					<section className="space-y-8 flex flex-col items-center">
						<div className="flex flex-col items-center">
							<Image
								src="/logo.svg"
								alt="Logo"
								width={100}
								height={100}
								className="hidden md:block invert dark:invert-0"
							/>
						</div>
						<h1 className="text-2xl md:text-5xl font-bold text-center">Build Something With ❤️</h1>
						<p className="text-lg text-muted-foreground text-center md:text-xl">Create Beautiful Apps and Websites with Ai</p>

						<div className="max-w-3xl w-full">
							<ProjectForm />
						</div>
						<ProjectList />
					</section>
				</div>
			</div>
		</>
	);
}
