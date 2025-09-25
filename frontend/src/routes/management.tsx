import { Header } from "@/components/layout/Header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/management")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header />
      <div>Hello "/management"!</div>
    </div>
  );
}
