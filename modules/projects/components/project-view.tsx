"use client";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useState } from "react";
import ProjectHeader from "./project-header";
import MessageContainer from "./message-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FragmentWeb from "./fragment-view";
import { FileExplorer } from "./file-explorer";
import { useIsMobile } from "@/hooks/use-mobile";

type ProjectViewProps = {
	projectId: string;
};

type FragmentLike = {
	id: string;
	title?: string;
	sandboxUrl?: string | null;
	files?: unknown;
} | null;

const toFileMap = (value: unknown): Record<string, string> | null => {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;

	const entries = Object.entries(value as Record<string, unknown>);
	const areAllStrings = entries.every(([, v]) => typeof v === "string");

	if (!areAllStrings) return null;

	return Object.fromEntries(entries) as Record<string, string>;
};

const ProjectView = ({ projectId }: ProjectViewProps) => {
	const [activeFragment, setActiveFragment] = useState<FragmentLike>(null);
	const [tabState, setTabState] = useState("preview");

	const files = toFileMap(activeFragment?.files);

	const isMobile = useIsMobile();
	const orientation = isMobile ? "vertical" : "horizontal";

	return (
		<div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
			<ResizablePanelGroup
				orientation={orientation}
				className="flex-1 h-full w-full"
			>
				{/* LEFT PANEL */}
				<ResizablePanel
					defaultSize={isMobile ? 50 : 35}
					minSize={isMobile ? 20 : 10}
					className="flex flex-col min-h-0 min-w-0"
				>
					<ProjectHeader projectId={projectId} />

					<div className="flex-1 min-h-0 overflow-hidden">
						<MessageContainer
							projectId={projectId}
							activeFragment={activeFragment}
							setActiveFragment={setActiveFragment}
						/>
					</div>
				</ResizablePanel>

				<ResizableHandle
					withHandle
					className={
						isMobile
							? "h-2 cursor-row-resize hover:bg-primary/30 transition-colors"
							: "w-2 cursor-col-resize hover:bg-primary/30 transition-colors"
					}
				/>

				{/* RIGHT PANEL */}
				<ResizablePanel
					defaultSize={isMobile ? 50 : 65}
					minSize={isMobile ? 20 : 10}
					className="flex flex-col min-h-0 min-w-0"
				>
					<Tabs
						className="flex flex-col flex-1 min-h-0"
						defaultValue="preview"
						value={tabState}
						onValueChange={(v) => setTabState(v)}
					>
						{/* Tabs Header */}
						<div className="w-full flex items-center flex-wrap p-3 border-b gap-2 bg-sidebar/30 backdrop-blur-sm">
							<TabsList className="h-8 p-0 border rounded-md bg-muted/50">
								<TabsTrigger
									value="preview"
									className="px-3 text-xs flex items-center gap-1.5"
								>
									<EyeIcon className="size-3.5" />
									Demo
								</TabsTrigger>

								<TabsTrigger
									value="code"
									className="px-3 text-xs flex items-center gap-1.5"
								>
									<Code className="size-3.5" />
									Code
								</TabsTrigger>
							</TabsList>

							<div className="ml-auto">
								<Button
									asChild
									size="sm"
									variant="outline"
									className="h-8 text-xs gap-1.5"
								>
									<Link href="/pricing">
										<CrownIcon className="size-3.5" />
										<span className="hidden sm:inline">Upgrade</span>
									</Link>
								</Button>
							</div>
						</div>

						{/* PREVIEW TAB */}
						<TabsContent
							value="preview"
							className="flex-1 min-h-0 overflow-hidden m-0"
						>
							{activeFragment ? (
								<FragmentWeb data={activeFragment} />
							) : (
								<div className="flex items-center justify-center h-full text-muted-foreground">
									<p>Select a fragment to preview</p>
								</div>
							)}
						</TabsContent>

						{/* CODE TAB */}
						<TabsContent
							value="code"
							className="flex-1 min-h-0 overflow-auto m-0"
						>
							{files ? (
								<FileExplorer files={files} />
							) : (
								<div className="flex items-center justify-center h-full text-muted-foreground">
									<p>Select a fragment to view code</p>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default ProjectView;
