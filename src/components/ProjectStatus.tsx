import type { Project } from "~/pages/api/projects";

type ProjectStatusProps = {
  projects: Project[];
};

export default function ProjectStatus({ projects }: ProjectStatusProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 text-xl font-semibold">Project Status</h2>
      {!projects || projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded border p-3">
              <div className="flex justify-between">
                <h3 className="font-medium">{project.name}</h3>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
                  {project.status}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${project.completion}%` }}
                ></div>
              </div>
              <p className="mt-1 text-right text-sm">{project.completion}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
