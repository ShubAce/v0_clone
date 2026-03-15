import dynamic from "next/dynamic";

type CodeViewProps = {
	code: string;
	lang?: string;
};

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
});

const normalizeLanguage = (lang: string) => {
	const value = lang.toLowerCase();

	if (value === "ts" || value === "tsx") return "typescript";
	if (value === "js" || value === "jsx") return "javascript";
	if (value === "sh" || value === "bash") return "shell";
	if (value === "yml") return "yaml";
	if (value === "text") return "plaintext";

	return value;
};

export const CodeView = ({ code, lang = "text" }: CodeViewProps) => {
	return (
		<div className="h-full w-full overflow-hidden">
			<MonacoEditor
				height="100%"
				language={normalizeLanguage(lang)}
				value={code}
				theme="vs-dark"
				options={{
					readOnly: true,
					minimap: { enabled: false },
					fontSize: 13,
					lineHeight: 20,
					scrollBeyondLastLine: false,
					wordWrap: "on",
					automaticLayout: true,
					padding: { top: 12, bottom: 12 },
				}}
			/>
		</div>
	);
};
