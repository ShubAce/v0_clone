"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextAreaAutoSize from "react-textarea-autosize";
import { toast } from "sonner";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

import { ArrowUpIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCreateMessage } from "@/modules/messages/hooks/messages";

const formSchema = z.object({
	content: z.string().min(1, "Message Description is Required").max(1000, "Description too long"),
});

const MessageForm = ({ projectId }: { projectId: string }) => {
	const [isFocused, setIsFocused] = useState(false);

	const { mutateAsync, isPending } = useCreateMessage(projectId);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
		mode: "onChange",
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await mutateAsync(values.content);
			toast.success("Message sent successfully!");
			form.reset();
		} catch (error) {
			toast.error("Failed to send message. Please try again.");
			console.error("Error sending message:", error);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn(
					"relative border p-4 pt-1 rounded-2xl bg-sidebar dark:bg-sidebar transition-all duration-200",
					isFocused && "shadow-[0_0_15px_rgba(0,0,0,0.05)] border-primary/30 ring-4 ring-primary/10",
				)}
			>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<TextAreaAutoSize
							{...field}
							disabled={isPending}
							placeholder="Describe what you want to create..."
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							minRows={3}
							maxRows={8}
							className={cn(
								"pt-4 resize-none border-none w-full outline-none bg-transparent placeholder:text-muted-foreground/60 text-[15px] leading-relaxed",
								isPending && "opacity-50",
							)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
									e.preventDefault();
									form.handleSubmit(onSubmit)(e);
								}
							}}
						/>
					)}
				/>
				<div className="flex gap-x-2 items-end justify-between pt-2">
					<div className="text-[10px] text-muted-foreground/80 font-medium tracking-tight">
						<kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/50">
							<span>&#8984;</span>Enter
						</kbd>
						&nbsp; to submit
					</div>
					<Button
						className={cn("size-8 rounded-full transition-all shrink-0 active:scale-95", isPending && "bg-muted-foreground border")}
						type="submit"
						disabled={isPending}
						size="icon"
					>
						{isPending ? <Spinner className="size-4" /> : <ArrowUpIcon className="size-4" />}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default MessageForm;
