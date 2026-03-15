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
				"flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-2 hover:bg-secondary transition-colors",
				isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary",
			)}
			onClick={onFragmentClick}
		>
			<Code2Icon className="size-4 mt-0.5" />
			<div className="flex flex-col flex-1">
				<span className="text-sm font-medium line-clamp-1">{fragment?.title || "Code Fragment"}</span>
				<span className="text-sm">Preview</span>
			</div>
			<div className="flex items-center justify-center mt-0.5">
				<span>
					<ChevronRightIcon className="text-sm" />
				</span>
			</div>
		</button>
	);
};

const UserMessage = ({ content }: Pick<MessageCardProps, "content">) => {
	return (
		<div className="flex justify-end pb-4 pr-2 pl-10">
			<Card className={"rounded-lg bg-muted p-2 shadow-none border-none max-w-[80%] wrap-break-word"}>{content}</Card>
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
	return (
		<div className={cn("flex flex-col group px-2 pb-4", type === MessageType.ERROR && "text-red-800 dark:text-red-700")}>
			<div className="flex items-center gap-2 pl-2 mb-2">
				<Image
					src={"/logo.svg"}
					height={30}
					width={30}
					alt="V0"
					className="invert dark:invert-0"
				/>
				<span className="text-sm font-medium">V0</span>
				<span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
					{format(new Date(createdAt), "HH:mm 'on' MMM dd, yyyy")}
				</span>
			</div>
			<div className="pl-8 flex flex-col gap-y-4">
				<span>{content}</span>
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
		<div className="mt-5">
			<UserMessage content={content} />
		</div>
	);
}

export default MessageCard;
