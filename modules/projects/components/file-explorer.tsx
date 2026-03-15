import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { CodeView } from "./code-view";
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { Hint } from "@/components/ui/hint";
import { useIsMobile } from "@/hooks/use-mobile";

type FileMap = Record<string, string>;

const FileBreadcrumb = ({ filePath }: { filePath: string }) => {
	const pathSegments = filePath.split("/");
	const maxSegments = 4;

	const renderBreadCrumItems = () => {
		if (pathSegments.length <= maxSegments) {
			return pathSegments.map((segment: string, index: number) => {
				const isLast = index === pathSegments.length - 1;

				return (
					<Fragment key={index}>
						<BreadcrumbItem>
							{isLast ? (
								<BreadcrumbPage className="font-medium text-foreground">{segment}</BreadcrumbPage>
							) : (
								<span className="text-muted-foreground/80 hover:text-foreground transition-colors cursor-default">{segment}</span>
							)}
						</BreadcrumbItem>
						{!isLast && <BreadcrumbSeparator className="text-muted-foreground/40" />}
					</Fragment>
				);
			});
		} else {
			const firstSegment = pathSegments[0];
			const lastSegment = pathSegments[pathSegments.length - 1];

			return (
				<>
					<BreadcrumbItem>
						<span className="text-muted-foreground/80 hover:text-foreground transition-colors cursor-default">{firstSegment}</span>
						<BreadcrumbSeparator className="text-muted-foreground/40" />
						<BreadcrumbItem>
							<BreadcrumbEllipsis />
						</BreadcrumbItem>
						<BreadcrumbSeparator className="text-muted-foreground/40" />
						<BreadcrumbItem className="font-medium text-foreground">{lastSegment}</BreadcrumbItem>
					</BreadcrumbItem>
				</>
			);
		}
	};

	return (
		<Breadcrumb>
			<BreadcrumbList className="sm:gap-2">{renderBreadCrumItems()}</BreadcrumbList>
		</Breadcrumb>
	);
};

function getLanguageFromExtension(filename: string) {
	const extension = filename.split(".").pop()?.toLowerCase();

	const languageMap: Record<string, string> = {
		js: "javascript",
		jsx: "jsx",
		ts: "typescript",
		tsx: "tsx",
		py: "python",
		html: "html",
		css: "css",
		json: "json",
		md: "markdown",
	};

	return extension ? languageMap[extension] || "text" : "text";
}

export const FileExplorer = ({ files }: { files: FileMap }) => {
	const [copied, setCopied] = useState(false);
	const isMobile = useIsMobile();
	const [selectedFile, setSelectedFile] = useState<string | null>(() => {
		const fileKeys = Object.keys(files);
		return fileKeys.length > 0 ? fileKeys[0] : null;
	});

	const treeData = useMemo(() => {
		return convertFilesToTreeItems(files);
	}, [files]);

	const handleFileSelect = useCallback(
		(filePath: string) => {
			if (files[filePath]) {
				setSelectedFile(filePath);
			}
		},
		[files],
	);
	const handleCopy = useCallback(() => {
		if (selectedFile && files[selectedFile]) {
			navigator.clipboard
				.writeText(files[selectedFile])
				.then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				})
				.catch((error) => {
					console.error("Failed to copy:", error);
				});
		}
	}, [selectedFile, files]);

	return (
		<ResizablePanelGroup
			orientation={isMobile ? "vertical" : "horizontal"}
			className="h-full min-h-0"
		>
			<ResizablePanel
				defaultSize={isMobile ? 34 : 25}
				minSize={isMobile ? 18 : 10}
				className="bg-sidebar min-h-0 min-w-0"
			>
				<div className="h-full overflow-auto p-1">
					<TreeView
						data={treeData}
						value={selectedFile}
						onSelect={handleFileSelect}
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

			<ResizablePanel
				defaultSize={isMobile ? 66 : 75}
				minSize={isMobile ? 20 : 10}
				className="min-h-0 min-w-0"
			>
				{selectedFile && files[selectedFile] ? (
					<div className="h-full w-full flex flex-col relative bg-background">
						<div className="border-b bg-sidebar/60 backdrop-blur-md px-3 sm:px-4 py-2 flex justify-between items-center gap-x-2 sticky top-0 z-10 w-full min-h-11">
							<div className="min-w-0 flex-1 overflow-hidden">
								<FileBreadcrumb filePath={selectedFile} />
							</div>
							<Hint
								text="Copy to clipboard"
								side="bottom"
								align="end"
							>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 hover:bg-background/80"
									onClick={handleCopy}
								>
									{copied ? <CopyCheckIcon className="h-3.5 w-3.5 text-green-500" /> : <CopyIcon className="h-3.5 w-3.5" />}
								</Button>
							</Hint>
						</div>
						<div className="flex-1 overflow-auto w-full relative">
							<CodeView
								code={files[selectedFile]}
								lang={getLanguageFromExtension(selectedFile)}
							/>
						</div>
					</div>
				) : (
					<div className="flex h-full items-center justify-center text-muted-foreground bg-background">
						<p className="text-sm">Select a file to view its content</p>
					</div>
				)}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
