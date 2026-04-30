import { ProjectForm } from "@/components/forms/project-form";
import { MobilePage } from "@/components/layout/mobile-page";
import { ProjectList } from "@/components/lists/project-list";
import { getProjectsPage } from "@/features/projects/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjectsPage();

  return (
    <MobilePage
      eyebrow="Project Management"
      title="Projects"
      description="Create and review project records for PillarPro."
    >
      <ProjectForm />
      <ProjectList
        projects={projects.rows}
        totalCount={projects.pagination.total}
      />
    </MobilePage>
  );
}
