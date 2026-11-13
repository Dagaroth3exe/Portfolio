import type { Project } from "../../lib/content";

/**
 * Renders a project title. The design language is monochrome, so titles are
 * plain text (the `titleAccent` gradient in content.ts is intentionally unused).
 */
export default function ProjectName({ project }: { project: Pick<Project, "title" | "titleAccent"> }) {
  return <>{project.title}</>;
}
