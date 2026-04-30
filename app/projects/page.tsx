import { ProjectForm } from "@/components/forms/project-form";
import { MobilePage } from "@/components/layout/mobile-page";
import { ProjectList } from "@/components/lists/project-list";
import { getProjects } from "@/features/projects/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <MobilePage
      eyebrow="Project Management"
      title="Projects"
      description="Create and review project records for PillarPro."
    >
      <ProjectForm />
      <ProjectList projects={projects} />
    </MobilePage>
  );
}
