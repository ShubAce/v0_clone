import React, { useEffect, useRef } from "react";
import { useGetMessages, prefetchMessages } from "@/modules/messages/hooks/messages";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import MessageCard from "./message-card";
import { MessageRole } from "@/src/generated/enums";
import MessageForm from "./message-form";
import MessageLoader from "./message-loader";

type FragmentLike = {
	id: string;
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
			<div className="flex items-center justify-center h-full">
				<Spinner className={"text-emerald-600"} />
			</div>
		);
	}
	if (isError) {
		return <div className="flex items-center justify-center h-full text-red-500">Error: {error?.message || "Failed to load messages."}</div>;
	}

	if (!messages || messages.length === 0) {
		return (
			<div className="flex flex-col flex-1 min-h-0">
				<div className="flex flex-1 items-center justify-center text-muted-foreground">No messages to display.</div>
				<div className="relative p-3 pt-1">
					<div className="absolute -top-6 left-0 right-0 h-6 bg-linear-to-b from-transparent to-background pointer-events-none" />
					{/*input for new message*/}
				</div>
			</div>
		);
	}
	const lastMessage = messages[messages.length - 1];

	const isLastMessageUser = lastMessage.role === MessageRole.USER;

	return (
		<div className="flex flex-col flex-1 min-h-0">
			<div className="flex-1 min-h-0 overflow-y-auto">
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
				<div ref={bottomRef} />
			</div>
			<div className="relative p-2 pt-1">
				<div className="absolute -top-6 left-0 right-0 h-6 bg-linear-to-b from-transparent to-background pointer-events-none" />
				<MessageForm projectId={projectId} />
			</div>
		</div>
	);
}

export default MessageContainer;
