"use client";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useState } from "react";
import ProjectHeader from "./project-header";
import MessageContainer from "./message-container";

type ProjectViewProps = {
	projectId: string;
};

type FragmentLike = {
	id: string;
} | null;

const ProjectView = ({ projectId }: ProjectViewProps) => {
	const [activeFragment, setActiveFragment] = useState<FragmentLike>(null);

	return (
		<div className="h-screen">
			<ResizablePanelGroup orientation="horizontal">
				<ResizablePanel
					minSize={20}
					defaultSize={35}
					className="flex flex-col min-h-0"
				>
					<ProjectHeader projectId={projectId} />
					<MessageContainer
						projectId={projectId}
						activeFragment={activeFragment}
						setActiveFragment={setActiveFragment}
					/>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel
					defaultSize={65}
					minSize={50}
				>
					{/*right side container for files and settings*/}
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default ProjectView;
