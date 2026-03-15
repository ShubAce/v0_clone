import Image from "next/image";
import React from "react";
import { useState, useEffect } from "react";

const ShimmerMessages = () => {
	const messages = [
		"Thinking...",
		"Processing your request...",
		"Generating...",
		"Analyzing your prompt...",
		"Writing code...",
		"Adding final touches...",
		"Almost there...",
	];

	const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setVisible(false);
			setTimeout(() => {
				setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
				setVisible(true);
			}, 300);
		}, 2200);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-1">
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
						style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
					/>
				))}
			</div>
			<span
				className="text-sm text-muted-foreground transition-opacity duration-300"
				style={{ opacity: visible ? 1 : 0 }}
			>
				{messages[currentMessageIndex]}
			</span>
		</div>
	);
};

const MessageLoading = () => {
	return (
		<div className="flex flex-col group px-2 pb-4">
			<div className="flex items-center gap-2 pl-2 mb-2">
				<Image
					src={"/logo.svg"}
					alt="Vibe"
					width={28}
					height={28}
					className="shrink-0 invert dark:invert-0"
				/>
				<span className="text-sm font-semibold">V0</span>
			</div>

			<div className="pl-8 flex flex-col gap-y-3">
				<ShimmerMessages />
				<div className="flex flex-col gap-2">
					{[100, 75, 50].map((w, i) => (
						<div
							key={i}
							className="h-3 rounded-full bg-muted animate-pulse"
							style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default MessageLoading;
