import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/management/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>Placeholder</div>
    </div>
  );
}
