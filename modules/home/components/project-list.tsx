"use client";
import { useGetProjects } from "../../projects/hooks/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function ProjectList() {
	const { data: projects, isPending } = useGetProjects();
	const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [totalSlides, setTotalSlides] = useState(0);

	useEffect(() => {
		if (!carouselApi) {
			return;
		}

		const update = () => {
			setTotalSlides(carouselApi.scrollSnapList().length);
			setCurrentSlide(carouselApi.selectedScrollSnap());
		};

		update();
		carouselApi.on("select", update);
		carouselApi.on("reInit", update);

		return () => {
			carouselApi.off("select", update);
			carouselApi.off("reInit", update);
		};
	}, [carouselApi]);

	const formatDate = (value: Date | string) => {
		const date = value instanceof Date ? value : new Date(value);
		return date.toLocaleDateString("en-US", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	if (isPending) {
		return (
			<div className="w-full mt-16 px-4">
				<h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Your Projects</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							className="h-32 w-full rounded-xl"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!projects || projects.length === 0) {
		return null;
	}

	const renderProjectCard = (project: (typeof projects)[number]) => (
		<Link
			href={`/project/${project.id}`}
			key={project.id}
			className="block h-full outline-none"
		>
			<Card className="group h-full hover:shadow-xl transition-all duration-300 border-zinc-800/50 hover:border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900/80">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between mb-3">
						<div className="p-2.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
							<FolderKanban className="w-5 h-5 text-emerald-500" />
						</div>
						<ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
					</div>
					<CardTitle className="text-lg text-zinc-100 group-hover:text-emerald-400 line-clamp-1 font-semibold transition-colors">
						{project.name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center text-sm text-zinc-500">
						<Calendar className="w-4 h-4 mr-1.5" />
						<span>{formatDate(project.createdAt)}</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);

	return (
		<div className="w-full mt-16">
			<h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Your Projects</h2>

			{/* Mobile Carousel View */}
			<div className="lg:hidden w-full max-w-md sm:max-w-2xl mx-auto px-4">
				<Carousel
					setApi={setCarouselApi}
					opts={{
						align: "start",
						dragFree: true,
						containScroll: "trimSnaps",
					}}
					className="w-full"
				>
					<CarouselContent className="-ml-4">
						{projects.map((project) => (
							<CarouselItem
								key={project.id}
								className="pl-4 basis-[85%] sm:basis-[60%]"
							>
								{renderProjectCard(project)}
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>

				{/* Pagination Dots */}
				{totalSlides > 1 && (
					<div className="mt-6 flex items-center justify-center gap-2">
						{Array.from({ length: totalSlides }).map((_, index) => (
							<button
								key={`dot-${index}`}
								onClick={() => carouselApi?.scrollTo(index)}
								aria-label={`Go to slide ${index + 1}`}
								className={`transition-all duration-300 ease-in-out ${
									index === currentSlide
										? "h-2 w-8 rounded-full bg-emerald-500"
										: "h-2 w-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
								}`}
							/>
						))}
					</div>
				)}
			</div>

			{/* Desktop Grid View */}
			<div className="hidden lg:grid grid-cols-3 gap-6 max-w-6xl mx-auto px-4">{projects.map((project) => renderProjectCard(project))}</div>
		</div>
	);
}

export default ProjectList;
