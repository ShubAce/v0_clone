import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetProjectById } from "../hooks/project";

const ProjectHeader = ({ projectId }: { projectId: string }) => {
	const { data: project, isPending } = useGetProjectById(projectId);

	const { setTheme, theme } = useTheme();
	return (
		<header className="px-3 py-2 flex justify-between items-center border-b bg-sidebar/60 backdrop-blur-md min-h-[50px] sticky top-0 z-10">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant={"ghost"}
						size={"sm"}
						className={"focus-visible:ring-0 hover:bg-muted/80 transition-colors !pl-2 h-8 rounded-md group"}
					>
						<Image
							src={"/logo.svg"}
							alt="Vibe"
							width={26}
							height={26}
							className="shrink-0 invert dark:invert-0 drop-shadow-sm"
						/>
						<span className="text-[13px] font-medium tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
							{isPending ? "Loading..." : project?.name || "Untitled Project"}
						</span>
						<ChevronDownIcon className="size-3.5 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					side={"bottom"}
					align={"start"}
					className="w-[200px]"
				>
					<DropdownMenuItem asChild className="cursor-pointer">
						<Link href={"/"}>
							<ChevronLeftIcon className="size-4 mr-2" />
							<span>Go to Dashboard</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className={"gap-2 cursor-pointer"}>
							<SunMoonIcon className="size-4 text-muted-foreground" />
							<span>Appearance</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent sideOffset={5}>
								<DropdownMenuRadioGroup
									value={theme}
									onValueChange={setTheme}
								>
									<DropdownMenuRadioItem value="light" className="cursor-pointer">Light</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="dark" className="cursor-pointer">Dark</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="system" className="cursor-pointer">System</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
};

export default ProjectHeader;
