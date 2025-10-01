import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/management/organization"!</div>;
}
