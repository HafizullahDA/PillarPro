import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectListItem } from "@/features/projects/types";
import { formatCurrency } from "@/lib/utils/formatters";

type ProjectListProps = {
  projects: ProjectListItem[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Project list</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            All projects loaded from Supabase.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
          {projects.length}
        </span>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No projects yet. Use the form above to create your first project." />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{project.agency_name}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                  {project.status}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[color:var(--muted)]">Advertised cost</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--foreground)]">
                    {formatCurrency(project.advertised_cost)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Awarded amount</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--foreground)]">
                    {formatCurrency(project.awarded_amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Start date</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--foreground)]">
                    {project.start_date ?? "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Project code</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--foreground)]">{project.code}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
