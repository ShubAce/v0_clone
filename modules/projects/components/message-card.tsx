import { MessageRole, MessageType } from "@/src/generated/enums";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon } from "lucide-react";

type FragmentLike = {
	id: string;
	title?: string;
} | null;

type MessageCardProps = {
	content: string;
	role: MessageRole;
	fragment: FragmentLike;
	createdAt: Date | string;
	isActiveFragment?: boolean;
	onFragmentClick?: () => void;
	type: MessageType;
};

const FragmentCard = ({
	fragment,
	isActiveFragment,
	onFragmentClick,
}: Pick<MessageCardProps, "fragment" | "isActiveFragment" | "onFragmentClick">) => {
	if (!fragment) {
		return null;
	}

	return (
		<button
			type="button"
			className={cn(
				"flex items-start text-start gap-2 border rounded-lg bg-muted/60 w-fit p-2.5 hover:bg-secondary hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-150",
				isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary hover:shadow-primary/20",
			)}
			onClick={onFragmentClick}
		>
			<Code2Icon className="size-4 mt-0.5 shrink-0" />
			<div className="flex flex-col flex-1 min-w-0">
				<span className="text-sm font-medium line-clamp-1">{fragment?.title || "Code Fragment"}</span>
				<span className="text-xs opacity-70">Preview</span>
			</div>
			<div className="flex items-center justify-center mt-0.5 shrink-0">
				<ChevronRightIcon className="size-4" />
			</div>
		</button>
	);
};

const UserMessage = ({ content }: Pick<MessageCardProps, "content">) => {
	return (
		<div className="flex justify-end pb-4 pr-2 pl-10 sm:pl-16">
			<Card className="rounded-2xl bg-muted/80 p-3 shadow-none border border-border/50 max-w-[85%] break-words text-sm leading-relaxed">
				{content}
			</Card>
		</div>
	);
};

const AssistantMessage = ({
	content,
	fragment,
	createdAt,
	isActiveFragment,
	onFragmentClick,
	type,
}: Pick<MessageCardProps, "content" | "fragment" | "createdAt" | "isActiveFragment" | "onFragmentClick" | "type">) => {
	const isError = type === MessageType.ERROR;
	return (
		<div className={cn("flex flex-col group px-2 pb-4", isError && "text-red-600 dark:text-red-500")}>
			<div className="flex items-center gap-2 pl-2 mb-2">
				<div className={cn("shrink-0 rounded-full p-0.5", isError ? "ring-1 ring-red-400/40" : "")}>
					<Image
						src={"/logo.svg"}
						height={28}
						width={28}
						alt="V0"
						className="invert dark:invert-0"
					/>
				</div>
				<span className="text-sm font-semibold">V0</span>
				<span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-60">
					{format(new Date(createdAt), "HH:mm · MMM dd")}
				</span>
			</div>
			<div className={cn("pl-8 flex flex-col gap-y-3", isError && "border-l-2 border-red-400/50 ml-2")}>
				<span className="text-sm leading-relaxed">{content}</span>
				{fragment && type === MessageType.RESULT && (
					<FragmentCard
						fragment={fragment}
						isActiveFragment={isActiveFragment}
						onFragmentClick={onFragmentClick}
					/>
				)}
			</div>
		</div>
	);
};

function MessageCard({ content, role, fragment, createdAt, isActiveFragment, onFragmentClick, type }: MessageCardProps) {
	if (role === MessageRole.ASSISTANT) {
		return (
			<AssistantMessage
				content={content}
				fragment={fragment}
				createdAt={createdAt}
				isActiveFragment={isActiveFragment}
				onFragmentClick={onFragmentClick}
				type={type}
			/>
		);
	}

	return (
		<div className="mt-4">
			<UserMessage content={content} />
		</div>
	);
}

export default MessageCard;
