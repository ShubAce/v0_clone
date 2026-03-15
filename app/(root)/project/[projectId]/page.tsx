import ProjectView from "@/modules/projects/components/project-view";

type ProjectPageProps = {
	params: Promise<{
		projectId: string;
	}>;
};

const Page = async ({ params }: ProjectPageProps) => {
	const { projectId } = await params;

	return <ProjectView projectId={projectId} />;
};

export default Page;
