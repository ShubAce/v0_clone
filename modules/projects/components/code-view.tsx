import { ScrollArea } from "@/components/ui/scroll-area";

type CodeViewProps = {
	code: string;
	lang?: string;
};

export const CodeView = ({ code, lang = "text" }: CodeViewProps) => {
	return (
		<ScrollArea className="h-full w-full">
			<pre className="p-4 text-sm leading-6">
				<code data-language={lang}>{code}</code>
			</pre>
		</ScrollArea>
	);
};
