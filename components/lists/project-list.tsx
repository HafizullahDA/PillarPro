"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectListItem } from "@/features/projects/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type ProjectListProps = {
  projects: ProjectListItem[];
  totalCount?: number;
};

export function ProjectList({ projects, totalCount }: ProjectListProps) {
  const router = useRouter();
  const [busyProjectId, setBusyProjectId] = useState("");
  const [error, setError] = useState("");

  async function handleRemoveProject(project: ProjectListItem) {
    const confirmed = window.confirm(
      `Delete project "${project.name}" and all related project records? This permanently removes linked labour, attendance, ledger rows, vendors, bills, receipts, partners, and expenses for this project.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyProjectId(project.id);
    setError("");

    try {
      const response = await fetch(`/api/projects?id=${project.id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete project.");
      }

      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Failed to delete project.",
      );
    } finally {
      setBusyProjectId("");
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Project list</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Recent projects loaded from Supabase.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
          {totalCount ?? projects.length}
        </span>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No projects yet. Use the form above to create your first project." />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
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
                    <div className="mt-1 text-sm text-[color:var(--muted)]">
                      {project.agency_name || "Agency not set"}
                    </div>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                    {project.status}
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                  <MetaRow label="Advertised cost" value={formatCurrency(project.advertised_cost)} />
                  <MetaRow label="Awarded amount" value={formatCurrency(project.awarded_amount)} />
                  <MetaRow label="Start date" value={project.start_date ?? "Not set"} />
                  <MetaRow label="Project code" value={project.code} />
                </dl>

                <button
                  type="button"
                  onClick={() => handleRemoveProject(project)}
                  disabled={busyProjectId === project.id}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[color:var(--danger)] bg-white px-4 text-sm font-semibold text-[color:var(--danger)] disabled:opacity-60"
                >
                  {busyProjectId === project.id ? "Deleting..." : "Delete project"}
                </button>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-[color:var(--border)] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Agency</th>
                    <th className="px-4 py-3 font-medium">Advertised cost</th>
                    <th className="px-4 py-3 font-medium">Awarded amount</th>
                    <th className="px-4 py-3 font-medium">Start date</th>
                    <th className="px-4 py-3 font-medium">Project code</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-semibold text-[color:var(--foreground)]">
                        {project.name}
                      </td>
                      <td className="px-4 py-3">{project.agency_name || "Not set"}</td>
                      <td className="px-4 py-3">{formatCurrency(project.advertised_cost)}</td>
                      <td className="px-4 py-3">{formatCurrency(project.awarded_amount)}</td>
                      <td className="px-4 py-3">{project.start_date ?? "Not set"}</td>
                      <td className="px-4 py-3">{project.code}</td>
                      <td className="px-4 py-3">{project.status}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(project)}
                          disabled={busyProjectId === project.id}
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[color:var(--danger)] bg-white px-3 text-sm font-semibold text-[color:var(--danger)] disabled:opacity-60"
                        >
                          {busyProjectId === project.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {error ? <p className="mt-4 text-sm font-medium text-[color:var(--danger)]">{error}</p> : null}
    </Card>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[color:var(--muted)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[color:var(--foreground)]">{value}</dd>
    </div>
  );
}
