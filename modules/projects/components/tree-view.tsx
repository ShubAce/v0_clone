"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarProvider,
	SidebarRail,
} from "@/components/ui/sidebar";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type TreeItem } from "@/lib/utils";

type TreeViewProps = {
	data: TreeItem[];
	value: string | null;
	onSelect: (path: string) => void;
};

type TreeProps = {
	item: TreeItem;
	selectedValue: string | null;
	onSelect: (path: string) => void;
	parentPath: string;
};

export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
	return (
		<SidebarProvider>
			<Sidebar
				collapsible="none"
				className="w-full bg-transparent border-none"
			>
				<SidebarContent>
					<SidebarGroup className="p-0">
						<SidebarGroupContent>
							<SidebarMenu>
								{data.map((item: TreeItem, index: number) => (
									<Tree
										key={index}
										item={item}
										selectedValue={value}
										onSelect={onSelect}
										parentPath=""
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarRail />
			</Sidebar>
		</SidebarProvider>
	);
};

const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
	const [name, ...items] = Array.isArray(item) ? item : [item];
	const currentPath = parentPath ? `${parentPath}/${name}` : name;

	if (!items.length) {
		const isSelected = selectedValue === currentPath;

		return (
			<SidebarMenuButton
				isActive={isSelected}
				className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-muted/60 transition-colors h-7 text-sm"
				onClick={() => onSelect?.(currentPath)}
			>
				<FileIcon className="size-3.5 text-muted-foreground/70 data-[active=true]:text-primary/70" />
				<span className="truncate">{name}</span>
			</SidebarMenuButton>
		);
	}

	// It's a folder

	return (
		<SidebarMenuItem>
			<Collapsible
				className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
				defaultOpen
			>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton className="hover:bg-muted/60 transition-colors h-7 text-sm font-medium">
						<ChevronRightIcon className="transition-transform size-3.5 text-muted-foreground/70" />
						<FolderIcon className="size-3.5 text-muted-foreground/80" />
						<span className="truncate">{name}</span>
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<SidebarMenuSub className="mr-0 pr-0 border-l border-border/40 ml-3.5">
					{items.map((item: TreeItem, index: number) => (
						<Tree
							key={index}
							item={item}
							selectedValue={selectedValue}
							onSelect={onSelect}
							parentPath={currentPath}
						/>
					))}
				</SidebarMenuSub>
			</Collapsible>
		</SidebarMenuItem>
	);
};
