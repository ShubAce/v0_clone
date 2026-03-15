"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

type HintProps = {
	children: React.ReactNode;
	text?: React.ReactNode;
	side?: React.ComponentProps<typeof TooltipContent>["side"];
	align?: React.ComponentProps<typeof TooltipContent>["align"];
};

export const Hint = ({ children, text, side, align }: HintProps) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				{text ? (
					<TooltipContent
						side={side}
						align={align}
					>
						{text}
					</TooltipContent>
				) : null}
			</Tooltip>
		</TooltipProvider>
	);
};
