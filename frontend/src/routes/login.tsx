import { createFileRoute } from "@tanstack/react-router";
import LoginFormComponent from "@/components/features/LoginFormComponent";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full overflow-clip grid grid-cols-10">
      <div className="col-span-4 bg-black"></div>
      <div className="col-span-6 flex items-center justify-center">
        <LoginFormComponent />
      </div>
    </div>
  );
}
