import Link from "next/link";

function formatMonthYear(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(new Date(iso));
}

export function ProjectTimeline({ projects }: { projects: any[] }) {
  return (
    <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
      {projects.map((project, index) => {
        const isStart = index % 2 === 0;
        const date = project.completedAt ?? project.createdAt;

        return (
          <li key={project.id}>
            {index > 0 && <hr />}

            <div className="timeline-middle">
              <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-white/10 bg-black/55 text-center text-[10px] leading-tight text-white/90 shadow-lg backdrop-blur-md">
                {formatMonthYear(date)}
              </span>
            </div>

            <div
              className={`mb-10 flex flex-col gap-2 ${
                isStart ? "timeline-start md:items-end md:text-end" : "timeline-end md:items-start"
              }`}
            >
              <Link
                href={`/projects/${project.id}`}
                className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/55 px-6 py-4 text-center shadow-lg backdrop-blur-md transition hover:bg-black/70"
              >
                <span className="text-lg font-black">{project.title}</span>
              </Link>
              <p className="max-w-xs text-white/70">{project.description}</p>
            </div>

            {index < projects.length - 1 && <hr />}
          </li>
        );
      })}
    </ul>
  );
}
