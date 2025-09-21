import { createFileRoute } from "@tanstack/react-router";
import LeftSideImage from "/login_page_left_side.jpg";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full overflow-clip grid grid-cols-10">
      <img src={LeftSideImage} className="col-span-4" />
      <div className="col-span-6 bg-amber-500">Card placeholder.</div>
    </div>
  );
}
