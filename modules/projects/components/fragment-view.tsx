"use client";

import { useState } from "react";
import { CopyCheckIcon, ExternalLink, ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";

type FragmentData = {
	id: string;
	sandboxUrl?: string | null;
};

function FragmentWeb({ data }: { data: FragmentData }) {
	const [fragmentKey, setFragmentKey] = useState(0);
	const [copied, setCopied] = useState(false);

	const onRefresh = () => {
		setFragmentKey((prev) => prev + 1);
	};
	const onCopy = async () => {
		await navigator.clipboard.writeText(data.sandboxUrl || "");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex flex-col w-full h-full">
			<div className="px-2 py-1.5 border-b bg-sidebar flex items-center gap-1.5 min-h-0">
				<Hint
					text="Refresh"
					side="bottom"
					align="start"
				>
					<Button
						size={"sm"}
						variant={"ghost"}
						onClick={onRefresh}
						className="h-7 w-7 p-0 shrink-0 hover:bg-muted"
					>
						<RefreshCcwIcon className="size-3.5" />
					</Button>
				</Hint>

				{/* URL bar */}
				<Button
					size={"sm"}
					variant={"outline"}
					onClick={onCopy}
					disabled={!data.sandboxUrl || copied}
					className="flex-1 min-w-0 h-7 justify-start text-start font-normal text-xs px-2 max-w-full"
				>
					{copied ? (
						<CopyCheckIcon className="size-3.5 shrink-0 text-green-500" />
					) : (
						<ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
					)}
					<span className="truncate ml-1.5 text-muted-foreground">
						{data.sandboxUrl || "No sandbox URL available"}
					</span>
				</Button>

				<Hint
					text="Open in new tab"
					side="bottom"
					align="end"
				>
					<Button
						size={"sm"}
						variant={"ghost"}
						onClick={() => {
							if (!data.sandboxUrl) {
								return;
							}
							window.open(data.sandboxUrl, "_blank");
						}}
						className="h-7 w-7 p-0 shrink-0 hover:bg-muted"
					>
						<ExternalLinkIcon className="size-3.5" />
					</Button>
				</Hint>
			</div>
			<iframe
				key={fragmentKey}
				className="h-full w-full"
				sandbox="allow-scripts allow-same-origin"
				loading="lazy"
				src={data.sandboxUrl || undefined}
			/>
		</div>
	);
}

export default FragmentWeb;
