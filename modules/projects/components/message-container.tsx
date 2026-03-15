import React, { useEffect, useRef } from "react";
import { useGetMessages, prefetchMessages } from "@/modules/messages/hooks/messages";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import MessageCard from "./message-card";
import { MessageRole } from "@/src/generated/enums";
import MessageForm from "./message-form";
import MessageLoader from "./message-loader";
import { SparklesIcon } from "lucide-react";

type FragmentLike = {
	id: string;
	title?: string;
	sandboxUrl?: string | null;
	files?: unknown;
} | null;

type MessageContainerProps = {
	projectId: string;
	activeFragment: FragmentLike;
	setActiveFragment: (fragment: FragmentLike) => void;
};

function MessageContainer({ projectId, activeFragment, setActiveFragment }: MessageContainerProps) {
	const queryClient = useQueryClient();
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const lastAssistantMessageIdRef = useRef<string | null>(null);

	const { data: messages, isPending, isError, error } = useGetMessages(projectId);

	useEffect(() => {
		if (projectId) {
			prefetchMessages(projectId, queryClient);
		}
	}, [projectId, queryClient]);

	useEffect(() => {
		const lastAssistantMessage = messages?.findLast((message) => message.role === MessageRole.ASSISTANT);

		if (lastAssistantMessage?.fragment && lastAssistantMessage.id !== lastAssistantMessageIdRef.current) {
			setActiveFragment(lastAssistantMessage?.fragment);
			lastAssistantMessageIdRef.current = lastAssistantMessage.id;
		}
	}, [messages, setActiveFragment]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages?.length]);

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-full bg-background/50">
				<Spinner className={"text-primary"} />
			</div>
		);
	}
	if (isError) {
		return <div className="flex items-center justify-center h-full text-red-500 bg-background/50">Error: {error?.message || "Failed to load messages."}</div>;
	}

	if (!messages || messages.length === 0) {
		return (
			<div className="flex flex-col flex-1 min-h-0 bg-background/30">
				<div className="flex flex-1 items-center justify-center text-muted-foreground p-4">
					<div className="flex flex-col items-center gap-4 text-center max-w-sm">
						<div className="size-16 rounded-full bg-muted/80 flex items-center justify-center shadow-sm">
							<SparklesIcon className="size-8 text-primary/60" />
						</div>
						<div className="space-y-1">
							<p className="text-base font-medium text-foreground">What do you want to build?</p>
							<p className="text-sm">Describe the UI component or page you have in mind to get started.</p>
						</div>
					</div>
				</div>
				<div className="relative p-3 pt-2 w-full max-w-3xl mx-auto">
					<div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-sidebar/20 pointer-events-none" />
					<MessageForm projectId={projectId} />
				</div>
			</div>
		);
	}
	const lastMessage = messages[messages.length - 1];

	const isLastMessageUser = lastMessage.role === MessageRole.USER;

	return (
		<div className="flex flex-col flex-1 min-h-0 bg-background/30 relative">
			<div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
				<div className="flex flex-col gap-2 w-full max-w-3xl mx-auto px-2 sm:px-4 py-4 pb-8">
					{messages.map((message) => (
						<MessageCard
							key={message.id}
							content={message.content}
							role={message.role}
							fragment={message.fragment}
							createdAt={message.createdAt}
							isActiveFragment={activeFragment?.id === message.fragment?.id}
							onFragmentClick={() => setActiveFragment(message.fragment)}
							type={message.type}
						/>
					))}
					{isLastMessageUser && <MessageLoader />}
					<div ref={bottomRef} className="h-4" />
				</div>
			</div>
			<div className="relative p-3 pt-2 w-full max-w-4xl mx-auto bg-background/80 backdrop-blur-md border-t border-border/40">
				<MessageForm projectId={projectId} />
			</div>
		</div>
	);
}

export default MessageContainer;
